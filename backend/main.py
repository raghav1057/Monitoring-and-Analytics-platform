from fastapi import FastAPI, Depends, HTTPException, status, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from datetime import datetime, timezone
from contextlib import asynccontextmanager
import os
from dotenv import load_dotenv

from realtime import hub

from database import get_db, init_db, Camera, Event, Watchlist, Alert
from schemas import (
    CameraCreate, CameraResponse, CameraUpdate,
    EventCreate, EventResponse,
    WatchlistCreate, WatchlistResponse,
    AlertCreate, AlertResponse, AlertAcknowledge
)

load_dotenv()

CORS_ORIGINS = [o.strip() for o in os.getenv(
    "CORS_ORIGINS", "http://localhost:5173,http://localhost:3000"
).split(",") if o.strip()]

app = FastAPI(
    title="CCTV Monitoring Platform API",
    description="Real-time video analytics and alerting system",
    version="1.0.0"
)

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    print("Database initialized")
    yield

app.router.lifespan_context = lifespan


# ===== HEALTH CHECK =====
@app.get("/health")
def health_check():
    return {"status": "ok", "timestamp": datetime.now(timezone.utc)}


# ===== CAMERA ENDPOINTS =====

@app.post("/api/cameras", response_model=CameraResponse)
def create_camera(camera: CameraCreate, db: Session = Depends(get_db)):
    """Add a new camera to the registry"""
    
    # Check if camera already exists
    existing = db.query(Camera).filter(Camera.camera_id == camera.camera_id).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Camera with this ID already exists"
        )
    
    db_camera = Camera(**camera.model_dump())
    db.add(db_camera)
    db.commit()
    db.refresh(db_camera)
    
    return db_camera


@app.get("/api/cameras", response_model=list[CameraResponse])
def list_cameras(db: Session = Depends(get_db)):
    """Get all cameras"""
    cameras = db.query(Camera).all()
    return cameras


@app.get("/api/cameras/{camera_id}", response_model=CameraResponse)
def get_camera(camera_id: str, db: Session = Depends(get_db)):
    """Get a specific camera by ID"""
    camera = db.query(Camera).filter(Camera.camera_id == camera_id).first()
    if not camera:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Camera not found"
        )
    return camera


@app.put("/api/cameras/{camera_id}", response_model=CameraResponse)
def update_camera(
    camera_id: str, 
    camera_update: CameraUpdate, 
    db: Session = Depends(get_db)
):
    """Update camera details"""
    camera = db.query(Camera).filter(Camera.camera_id == camera_id).first()
    if not camera:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Camera not found"
        )
    
    for field, value in camera_update.model_dump(exclude_unset=True).items():
        setattr(camera, field, value)
    
    camera.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(camera)
    return camera


@app.delete("/api/cameras/{camera_id}")
def delete_camera(camera_id: str, db: Session = Depends(get_db)):
    """Disable/delete a camera"""
    camera = db.query(Camera).filter(Camera.camera_id == camera_id).first()
    if not camera:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Camera not found"
        )
    
    db.delete(camera)
    db.commit()
    return {"message": f"Camera {camera_id} deleted"}


@app.post("/api/cameras/{camera_id}/heartbeat", response_model=CameraResponse)
def heartbeat(camera_id: str, db: Session = Depends(get_db)):
    """Camera says 'I am alive'. Marks it Online."""
    camera = db.query(Camera).filter(Camera.camera_id == camera_id).first()
    if not camera:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Camera not found")
    camera.last_heartbeat = datetime.now(timezone.utc)
    camera.status = "Online"
    db.commit()
    db.refresh(camera)
    return camera


@app.get("/api/cameras/{camera_id}/stream")
def stream_info(camera_id: str, db: Session = Depends(get_db)):
    """What feed is this camera on, and is it live?"""
    camera = db.query(Camera).filter(Camera.camera_id == camera_id).first()
    if not camera:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Camera not found")
    protocol = getattr(camera, "source_protocol", "file") or "file"
    live = False
    if protocol == "rtsp":
        live = camera.status == "Online"  # trust heartbeat, don't freeze on probe
    else:
        try:
            from video import make_source
            src = make_source(protocol, camera.stream_url or camera_id)
            live = bool(src.open())
            src.close()
        except Exception:
            live = False
    return {
        "camera_id": camera.camera_id,
        "protocol": protocol,
        "endpoint": camera.stream_url,
        "status": camera.status,
        "live": live,
    }


# ===== EVENT ENDPOINTS =====

@app.post("/api/events", response_model=EventResponse)
async def create_event(event: EventCreate, db: Session = Depends(get_db)):
    """Receive detection event from AI model"""
    
    # Validate camera exists
    camera = db.query(Camera).filter(Camera.camera_id == event.camera_id).first()
    if not camera:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Camera {event.camera_id} not found"
        )
    
    # Validate confidence score
    if not (0 <= event.confidence <= 1):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Confidence must be between 0 and 1"
        )

    # Skip double events: same car, same camera, within 60 seconds
    from matcher import is_duplicate
    last = db.query(Event).filter(
        Event.camera_id == event.camera_id,
        Event.vehicle_number == event.vehicle_number,
    ).order_by(Event.timestamp.desc()).first()
    if last and is_duplicate(last.timestamp, event.timestamp):
        return last

    db_event = Event(**event.model_dump())
    db.add(db_event)
    db.commit()
    db.refresh(db_event)

    await hub.broadcast("events", {
        "type": "event",
        "event_id": db_event.event_id,
        "camera_id": db_event.camera_id,
        "vehicle_number": db_event.vehicle_number,
        "confidence": db_event.confidence,
        "timestamp": db_event.timestamp.isoformat() if db_event.timestamp else None,
    })

    return db_event


@app.get("/api/events", response_model=list[EventResponse])
def list_events(
    camera_id: str = None,
    vehicle_number: str = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """Get events with optional filters"""
    query = db.query(Event)
    
    if camera_id:
        query = query.filter(Event.camera_id == camera_id)
    
    if vehicle_number:
        query = query.filter(Event.vehicle_number == vehicle_number)
    
    events = query.order_by(Event.timestamp.desc()).offset(skip).limit(limit).all()
    return events


# ===== WATCHLIST ENDPOINTS =====

@app.post("/api/watchlist", response_model=WatchlistResponse)
def create_watchlist_entry(entry: WatchlistCreate, db: Session = Depends(get_db)):
    """Add entry to watchlist"""
    
    # Check if already exists
    existing = db.query(Watchlist).filter(
        Watchlist.entity_identifier == entry.entity_identifier
    ).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Entity already in watchlist"
        )
    
    db_entry = Watchlist(**entry.model_dump())
    db.add(db_entry)
    db.commit()
    db.refresh(db_entry)
    
    return db_entry


@app.get("/api/watchlist", response_model=list[WatchlistResponse])
def list_watchlist(db: Session = Depends(get_db)):
    """Get all watchlist entries"""
    entries = db.query(Watchlist).filter(Watchlist.status == "Active").all()
    return entries


@app.get("/api/watchlist/{entity_id}", response_model=WatchlistResponse)
def get_watchlist_entry(entity_id: str, db: Session = Depends(get_db)):
    """Get specific watchlist entry by identifier"""
    entry = db.query(Watchlist).filter(
        Watchlist.entity_identifier == entity_id
    ).first()
    if not entry:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Entity not found in watchlist"
        )
    return entry


# ===== ALERT ENDPOINTS =====

@app.post("/api/alerts", response_model=AlertResponse)
async def create_alert(alert: AlertCreate, db: Session = Depends(get_db)):
    """Create an alert (internal use)"""
    db_alert = Alert(**alert.model_dump())
    db.add(db_alert)
    db.commit()
    db.refresh(db_alert)

    await hub.broadcast("alerts", {
        "type": "alert",
        "alert_id": db_alert.alert_id,
        "camera_id": db_alert.camera_id,
        "matched_entity": db_alert.matched_entity,
        "confidence": db_alert.confidence,
    })

    return db_alert


@app.get("/api/alerts", response_model=list[AlertResponse])
def list_alerts(
    status: str = None,
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db)
):
    """Get alerts with optional status filter"""
    query = db.query(Alert)
    
    if status:
        query = query.filter(Alert.alert_status == status)
    
    alerts = query.order_by(Alert.created_at.desc()).offset(skip).limit(limit).all()
    return alerts


@app.put("/api/alerts/{alert_id}/acknowledge")
def acknowledge_alert(
    alert_id: int,
    ack: AlertAcknowledge,
    db: Session = Depends(get_db)
):
    """Acknowledge an alert"""
    alert = db.query(Alert).filter(Alert.alert_id == alert_id).first()
    if not alert:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Alert not found"
        )
    
    alert.alert_status = "ACKNOWLEDGED"
    alert.acknowledged_by = ack.operator_id
    alert.acknowledged_at = datetime.now(timezone.utc)
    
    db.commit()
    db.refresh(alert)
    return alert


# ===== REALTIME =====

@app.websocket("/ws/events")
async def ws_events(ws: WebSocket):
    await hub.connect("events", ws)
    try:
        while True:
            await ws.receive_text()
    except WebSocketDisconnect:
        hub.disconnect("events", ws)


@app.websocket("/ws/alerts")
async def ws_alerts(ws: WebSocket):
    await hub.connect("alerts", ws)
    try:
        while True:
            await ws.receive_text()
    except WebSocketDisconnect:
        hub.disconnect("alerts", ws)


# ===== DASHBOARD STATS =====

@app.get("/api/stats")
def get_stats(db: Session = Depends(get_db)):
    """Get system statistics"""
    total_cameras = db.query(Camera).count()
    online_cameras = db.query(Camera).filter(Camera.status == "Online").count()
    offline_cameras = db.query(Camera).filter(Camera.status == "Offline").count()
    
    active_alerts = db.query(Alert).filter(Alert.alert_status == "ACTIVE").count()
    total_events = db.query(Event).count()
    
    return {
        "total_cameras": total_cameras,
        "online_cameras": online_cameras,
        "offline_cameras": offline_cameras,
        "active_alerts": active_alerts,
        "total_events": total_events
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=int(os.getenv("UVICORN_PORT", "8000")),
        reload=os.getenv("ENV", "dev") == "dev"
    )

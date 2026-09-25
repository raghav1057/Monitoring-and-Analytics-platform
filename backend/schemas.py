from pydantic import BaseModel
from datetime import datetime
from typing import Optional, Dict, Any

# ===== CAMERA SCHEMAS =====

class CameraCreate(BaseModel):
    camera_id: str
    name: str
    department: str
    latitude: float
    longitude: float
    camera_type: str
    stream_url: str
    zone: Optional[str] = None
    source_protocol: Optional[str] = "file"
    storage_note: Optional[str] = None


class CameraUpdate(BaseModel):
    name: Optional[str] = None
    status: Optional[str] = None
    last_heartbeat: Optional[datetime] = None


class CameraResponse(BaseModel):
    camera_id: str
    name: str
    department: str
    latitude: float
    longitude: float
    camera_type: str
    stream_url: str
    status: str
    last_heartbeat: Optional[datetime] = None
    zone: Optional[str] = None
    source_protocol: Optional[str] = "file"
    storage_note: Optional[str] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ===== EVENT SCHEMAS =====

class EventCreate(BaseModel):
    camera_id: str
    timestamp: datetime
    event_type: str
    vehicle_number: str
    vehicle_type: str
    confidence: float
    bounding_box: Optional[Dict[str, Any]] = None


class EventResponse(BaseModel):
    event_id: int
    camera_id: str
    timestamp: datetime
    event_type: str
    vehicle_number: str
    vehicle_type: str
    confidence: float
    created_at: datetime

    class Config:
        from_attributes = True


# ===== WATCHLIST SCHEMAS =====

class WatchlistCreate(BaseModel):
    entity_identifier: str
    entity_type: str
    category: str
    reported_date: Optional[datetime] = None
    notes: Optional[str] = None


class WatchlistResponse(BaseModel):
    watchlist_id: int
    entity_identifier: str
    entity_type: str
    category: str
    status: str
    reported_date: Optional[datetime]
    created_at: datetime

    class Config:
        from_attributes = True


# ===== ALERT SCHEMAS =====

class AlertCreate(BaseModel):
    event_id: int
    watchlist_id: int
    camera_id: str
    matched_entity: str
    entity_type: str
    alert_type: str
    confidence: float
    location_lat: float
    location_lng: float


class AlertAcknowledge(BaseModel):
    operator_id: str
    notes: Optional[str] = None


class AlertResponse(BaseModel):
    alert_id: int
    event_id: int
    watchlist_id: int
    camera_id: str
    matched_entity: str
    entity_type: str
    alert_type: str
    confidence: float
    location_lat: float
    location_lng: float
    alert_status: str
    acknowledged_by: Optional[str]
    acknowledged_at: Optional[datetime]
    created_at: datetime

    class Config:
        from_attributes = True

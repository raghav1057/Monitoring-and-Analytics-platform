from sqlalchemy import create_engine, Column, String, Integer, Float, DateTime, Enum, JSON, ForeignKey, Text, Boolean
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime
import os
from dotenv import load_dotenv

load_dotenv()

# Database URL
DATABASE_URL = os.getenv(
    "DATABASE_URL", 
    "postgresql://postgres:postgres@localhost:5432/cctv_db"
)

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# ===== DATABASE MODELS =====

class Camera(Base):
    __tablename__ = "cameras"
    
    camera_id = Column(String(50), primary_key=True)
    name = Column(String(200), nullable=False)
    department = Column(String(100))
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    camera_type = Column(String(50))  # Traffic, RTO, Highway, etc.
    stream_url = Column(String(500))
    source_protocol = Column(String(20), default="file")  # file, rtsp, simulator
    storage_note = Column(String(200), nullable=True)  # where footage is kept
    status = Column(String(20), default="Offline")  # Online, Offline, Degraded
    last_heartbeat = Column(DateTime, default=datetime.utcnow)
    zone = Column(String(100))
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class Event(Base):
    __tablename__ = "events"
    
    event_id = Column(Integer, primary_key=True, autoincrement=True)
    camera_id = Column(String(50), ForeignKey("cameras.camera_id"))
    timestamp = Column(DateTime, nullable=False)
    event_type = Column(String(50))  # ANPR, person_detection, vehicle_detection
    vehicle_number = Column(String(50))
    vehicle_type = Column(String(50))  # Car, Bike, Truck, Bus
    confidence = Column(Float)
    bounding_box = Column(JSON)  # {x, y, width, height}
    created_at = Column(DateTime, default=datetime.utcnow)


class Watchlist(Base):
    __tablename__ = "watchlist"
    
    watchlist_id = Column(Integer, primary_key=True, autoincrement=True)
    entity_identifier = Column(String(100), nullable=False, unique=True)
    entity_type = Column(String(50))  # Vehicle, Person
    category = Column(String(100))  # Stolen, Wanted, Missing, Blacklisted
    status = Column(String(20), default="Active")  # Active, Resolved, Closed
    reported_date = Column(DateTime)
    notes = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)


class Alert(Base):
    __tablename__ = "alerts"
    
    alert_id = Column(Integer, primary_key=True, autoincrement=True)
    event_id = Column(Integer, ForeignKey("events.event_id"))
    watchlist_id = Column(Integer, ForeignKey("watchlist.watchlist_id"))
    camera_id = Column(String(50), ForeignKey("cameras.camera_id"))
    matched_entity = Column(String(100))
    entity_type = Column(String(50))  # Vehicle, Person
    alert_type = Column(String(100))  # Stolen, Wanted, Missing
    confidence = Column(Float)
    location_lat = Column(Float)
    location_lng = Column(Float)
    alert_status = Column(String(20), default="ACTIVE")  # ACTIVE, ACKNOWLEDGED, RESOLVED
    acknowledged_by = Column(String(50))
    acknowledged_at = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)


# Create all tables
def init_db():
    Base.metadata.create_all(bind=engine)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

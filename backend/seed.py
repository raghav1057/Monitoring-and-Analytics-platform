"""Fill the database with demo data. Run once: python seed.py

Makes: admin + operator logins, 2 cameras, 3 wanted vehicles.
Safe to run twice (skips what already exists).
"""

from database import SessionLocal, init_db, Camera, Watchlist, User
from auth import hash_password

CAMERAS = [
    {
        "camera_id": "C001",
        "name": "Nehru Bridge Junction",
        "department": "Traffic Police",
        "latitude": 23.0225,
        "longitude": 72.5714,
        "camera_type": "Traffic",
        "stream_url": "simulator:C001",
        "zone": "Downtown",
        "source_protocol": "simulator",
        "storage_note": "hot 7d",
        "status": "Online",
    },
    {
        "camera_id": "C002",
        "name": "RTO Checkpoint",
        "department": "RTO",
        "latitude": 23.0301,
        "longitude": 72.5801,
        "camera_type": "Static",
        "stream_url": "simulator:C002",
        "zone": "East Zone",
        "source_protocol": "simulator",
        "storage_note": "hot 7d",
        "status": "Online",
    },
]

WATCHLIST = [
    {"entity_identifier": "GJ01XX0001", "entity_type": "Vehicle", "category": "Stolen", "notes": "Reported stolen on 2026-08-10"},
    {"entity_identifier": "GJ02AB5678", "entity_type": "Vehicle", "category": "Blacklisted", "notes": "Linked to robbery case"},
    {"entity_identifier": "GJ03CD9999", "entity_type": "Vehicle", "category": "Wanted", "notes": "Fugitive vehicle"},
]

USERS = [
    ("admin", "admin123", "admin"),
    ("operator", "op1234", "operator"),
]


def main():
    init_db()
    db = SessionLocal()
    try:
        for u, p, r in USERS:
            if not db.query(User).filter(User.username == u).first():
                db.add(User(username=u, password_hash=hash_password(p), role=r))
                print(f"user: {u} ({r})")
        for c in CAMERAS:
            if not db.query(Camera).filter(Camera.camera_id == c["camera_id"]).first():
                db.add(Camera(**c))
                print(f"camera: {c['camera_id']}")
        for w in WATCHLIST:
            if not db.query(Watchlist).filter(Watchlist.entity_identifier == w["entity_identifier"]).first():
                db.add(Watchlist(**w, status="Active"))
                print(f"watchlist: {w['entity_identifier']}")
        db.commit()
        print("seed done. login: admin/admin123, operator/op1234")
    finally:
        db.close()


if __name__ == "__main__":
    main()

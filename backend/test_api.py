"""
Test script to verify Phase 1 API is working
Run this after starting the backend: python test_api.py
"""

import requests
import json
from datetime import datetime

BASE_URL = "http://localhost:8000"

def print_section(title):
    print(f"\n{'='*60}")
    print(f"  {title}")
    print(f"{'='*60}\n")

def test_health():
    """Test health check"""
    print_section("1. HEALTH CHECK")
    response = requests.get(f"{BASE_URL}/health")
    print(f"Status: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")

def test_add_cameras():
    """Add sample cameras"""
    print_section("2. ADD CAMERAS")
    
    cameras = [
        {
            "camera_id": "C001",
            "name": "Nehru Bridge Junction",
            "department": "Traffic Police",
            "latitude": 23.0225,
            "longitude": 72.5714,
            "camera_type": "Traffic",
            "stream_url": "rtsp://192.168.1.10/stream1",
            "zone": "Downtown"
        },
        {
            "camera_id": "C002",
            "name": "RTO Checkpoint",
            "department": "RTO",
            "latitude": 23.0301,
            "longitude": 72.5801,
            "camera_type": "Static",
            "stream_url": "rtsp://192.168.1.11/stream1",
            "zone": "East Zone"
        }
    ]
    
    for camera in cameras:
        response = requests.post(f"{BASE_URL}/api/cameras", json=camera)
        print(f"Added {camera['camera_id']}: {response.status_code}")
        if response.status_code != 200:
            print(f"  Error: {response.text}")

def test_list_cameras():
    """List all cameras"""
    print_section("3. LIST CAMERAS")
    response = requests.get(f"{BASE_URL}/api/cameras")
    cameras = response.json()
    print(f"Total cameras: {len(cameras)}")
    for cam in cameras:
        print(f"  - {cam['camera_id']}: {cam['name']} ({cam['status']})")

def test_add_watchlist():
    """Add watchlist entries"""
    print_section("4. ADD WATCHLIST ENTRIES")
    
    entries = [
        {
            "entity_identifier": "GJ01XX0001",
            "entity_type": "Vehicle",
            "category": "Stolen",
            "notes": "Reported stolen on 2026-08-10"
        },
        {
            "entity_identifier": "GJ02AB5678",
            "entity_type": "Vehicle",
            "category": "Blacklisted",
            "notes": "Linked to robbery case"
        },
        {
            "entity_identifier": "GJ03CD9999",
            "entity_type": "Vehicle",
            "category": "Wanted",
            "notes": "Fugitive vehicle"
        }
    ]
    
    for entry in entries:
        response = requests.post(f"{BASE_URL}/api/watchlist", json=entry)
        print(f"Added {entry['entity_identifier']}: {response.status_code}")
        if response.status_code != 200:
            print(f"  Error: {response.text}")

def test_list_watchlist():
    """List watchlist"""
    print_section("5. LIST WATCHLIST")
    response = requests.get(f"{BASE_URL}/api/watchlist")
    entries = response.json()
    print(f"Total watchlist entries: {len(entries)}")
    for entry in entries:
        print(f"  - {entry['entity_identifier']}: {entry['category']}")

def test_create_event():
    """Create detection event"""
    print_section("6. CREATE DETECTION EVENT")
    
    event = {
        "camera_id": "C001",
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "event_type": "ANPR",
        "vehicle_number": "GJ01XX0001",
        "vehicle_type": "Car",
        "confidence": 0.97,
        "bounding_box": {"x": 120, "y": 45, "width": 80, "height": 50}
    }
    
    response = requests.post(f"{BASE_URL}/api/events", json=event)
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        result = response.json()
        print(f"Event created with ID: {result['event_id']}")
        print(f"Vehicle: {result['vehicle_number']}")
        print(f"Confidence: {result['confidence']}")
    else:
        print(f"Error: {response.text}")

def test_list_events():
    """List events"""
    print_section("7. LIST EVENTS")
    response = requests.get(f"{BASE_URL}/api/events")
    events = response.json()
    print(f"Total events: {len(events)}")
    for event in events[:3]:  # Show first 3
        print(f"  - {event['vehicle_number']} at {event['camera_id']} ({event['confidence']*100:.0f}%)")

def test_stats():
    """Get dashboard stats"""
    print_section("8. DASHBOARD STATS")
    response = requests.get(f"{BASE_URL}/api/stats")
    stats = response.json()
    print(json.dumps(stats, indent=2))

def main():
    print("\n" + "="*60)
    print("  CCTV MONITORING PLATFORM - API TEST")
    print("="*60)
    print("\nMake sure backend is running: python main.py")
    
    try:
        test_health()
        test_add_cameras()
        test_list_cameras()
        test_add_watchlist()
        test_list_watchlist()
        test_create_event()
        test_list_events()
        test_stats()
        
        print("\n" + "="*60)
        print("  ✅ ALL TESTS COMPLETED")
        print("="*60)
        print("\nAPI Swagger Docs: http://localhost:8000/docs")
        
    except requests.exceptions.ConnectionError:
        print("\n❌ ERROR: Could not connect to backend")
        print("Make sure backend is running: python main.py")
    except Exception as e:
        print(f"\n❌ ERROR: {e}")

if __name__ == "__main__":
    main()

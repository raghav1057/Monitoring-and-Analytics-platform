"""Auto checks. Run: pytest backend/tests -q (from repo root)."""

import os

os.environ["DATABASE_URL"] = "sqlite:///./test_run.db"

import sys
from datetime import datetime, timedelta

sys.path.insert(0, "backend")

import pytest
from fastapi.testclient import TestClient

from database import init_db
from main import app
from matcher import danger_level, find_match, is_duplicate
from realtime import Hub

init_db()
client = TestClient(app)


def auth(username, password):
    r = client.post("/api/auth/register", json={"username": username, "password": password})
    assert r.status_code == 200, r.text
    return r.json()["access_token"]


def test_dedup_window():
    now = datetime.utcnow()
    assert is_duplicate(now, now + timedelta(seconds=30))
    assert not is_duplicate(now, now + timedelta(seconds=120))


def test_danger_levels():
    assert danger_level(0.95, "Stolen") == "HIGH"
    assert danger_level(0.75, "Other") == "MEDIUM"
    assert danger_level(0.3, "Other") == "LOW"


def test_hub_broadcast():
    import asyncio

    class Fake:
        def __init__(self):
            self.sent = []

        async def send_json(self, m):
            self.sent.append(m)

    async def go():
        h = Hub()
        f = Fake()
        h.channels["alerts"].add(f)
        await h.broadcast("alerts", {"type": "alert"})
        assert f.sent

    asyncio.run(go())


def test_auth_and_roles():
    admin = auth("t_admin", "pass1234")
    op = auth("t_op", "pass1234")
    cam = {
        "camera_id": "T001",
        "name": "Test Cam",
        "department": "Test",
        "latitude": 1.0,
        "longitude": 2.0,
        "camera_type": "Test",
        "stream_url": "simulator:T001",
    }
    assert client.post("/api/cameras", json=cam).status_code == 401  # no login
    assert (
        client.post(
            "/api/cameras", json=cam, headers={"Authorization": f"Bearer {op}"}
        ).status_code
        == 403
    )  # operator blocked
    assert (
        client.post(
            "/api/cameras", json=cam, headers={"Authorization": f"Bearer {admin}"}
        ).status_code
        == 200
    )  # admin ok
    assert client.get("/api/cameras").status_code == 200  # reads stay open


def test_trace_and_stats():
    r = client.get("/api/vehicles/NOPE123/trace")
    assert r.status_code == 200 and r.json()["sightings"] == 0
    r = client.get("/api/stats")
    body = r.json()
    assert "recent_events" in body and "degraded_cameras" in body

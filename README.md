# CCTV Monitoring & Video Analytics Platform

Central CCTV monitoring: camera registry, live feeds, AI events,
wanted-list match, instant alerts, map + car route. Built for the
okDriver hiring challenge (Gujarat Police Hackathon 2026).

## Quick start

**Need:** Python 3.12+, PostgreSQL 14+ (or Docker).

**With Docker (easiest):**
```bash
docker compose up
```
App: `http://localhost:8000` — Docs: `http://localhost:8000/docs`

**Manual:**
```bash
createdb cctv_db
cp backend/.env.example backend/.env   # set DATABASE_URL password
cd backend
pip install -r requirements.txt
python seed.py     # demo: 2 cameras + 3 wanted cars + logins
python main.py
```

**Login (demo):** `admin/admin123` (full) · `operator/op1234` (watch only)

**Checks:** `pytest backend/tests -q` (from repo root)

## API (main ones)

- `POST /api/auth/register` · `POST /api/auth/login` · `GET /api/auth/me`
- Cameras: `POST /api/cameras` (admin) · `GET /api/cameras` · `PUT /api/cameras/{id}` (admin) · `DELETE /api/cameras/{id}` (admin)
- `POST /api/cameras/{id}/heartbeat` · `GET /api/cameras/{id}/stream`
- `POST /api/events` (auto wanted-match + live push) · `GET /api/events`
- `GET /api/vehicles/{number}/trace` (map route)
- Watchlist: `POST /api/watchlist` (admin) · `GET /api/watchlist`
- Alerts: `POST /api/alerts` · `GET /api/alerts` · `PUT /api/alerts/{id}/acknowledge` (login)
- `GET /api/stats` · `GET /health`
- Live: `WS /ws/events` · `WS /ws/alerts`

Full list with try-it-out: `http://localhost:8000/docs`

## Layout

```
backend/   # API: main.py, database.py, schemas.py, auth.py, matcher.py,
           # realtime.py, ratelimit.py, video/, seed.py, tests/
docs/      # architecture.md, scale-note.md, demo-script.md
frontend/  # React app (separate work)
```

## Docs

- `docs/architecture.md` — how parts connect + event flow
- `docs/scale-note.md` — path from 2 cameras to 80,000
- `docs/demo-script.md` — 4-min video plan

## Notes

- Feeds now: file + simulator (working). Live RTSP later = only change the URL.
- Same car twice in 60 sec = one event.
- Never commit `.env` or passwords (see `.gitignore`).

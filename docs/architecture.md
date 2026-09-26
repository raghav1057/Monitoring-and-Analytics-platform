# Architecture

Simple view of how the parts connect.

```
 Camera feeds                    Backend (FastAPI)              Store
[file / simulator / RTSP] ---> video adapter ---> REST + WebSocket ---> PostgreSQL
      heartbeat ---/                 |  auto match                cameras, events,
                                     v                            watchlist, alerts,
                              watchlist <--> alerts               users, audit log
                                     |
                              dashboard + map (React)
                              Leaflet pins + route line
```

## Flow of one detection

1. Camera sends heartbeat, stays Online.
2. AI event comes in: `POST /api/events`.
3. Double events (same car, 60 sec) are skipped.
4. Number is checked against the wanted list.
5. Match -> alert saved + pushed live on `/ws/alerts`.
6. Operator sees it, clicks acknowledge.
7. Car route: `GET /api/vehicles/{number}/trace` for the map line.

## Live pieces

- `WS /ws/events` — new detections, no refresh.
- `WS /ws/alerts` — wanted matches, instant.
- `GET /api/stats` — counts + last 5 events for the dashboard.
- Login: admin adds cameras/wanted list, operator watches + closes alerts.

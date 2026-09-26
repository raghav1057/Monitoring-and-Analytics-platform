# Scale note: from demo to 80,000 cameras

We run 2 cameras now. Same design grows like this.

## 3 layers

- **Edge** (near camera): small box does detection (ANPR), sends only
  text events, not full video. Saves bandwidth.
- **Regional** (city server): joins events, runs wanted-list match,
  keeps hot video (last 7 days).
- **Central** (main cloud): full history, dashboards, reports.

## Key points

- **Bandwidth**: edge sends ~1 KB event text instead of video stream.
  Only alert clips go up in full.
- **Database**: index on `(vehicle_number, timestamp)` and `camera_id`.
  Split by month when big. Cache hot stats in Redis later.
- **Video store**: hot (7 days, fast disk), warm (90 days, cheap disk),
  cold (years, archive). Only alert clips kept long.
- **GPU**: needed only at edge/regional for AI detection, not for the API.
- **Health**: heartbeat + load balancer; dead server auto-replaced.
- **Safety**: separate camera network, HTTPS outside, secrets in env only.

## Rough cost idea

Per 1000 edge cameras: ~25 edge boxes (GPU) + 2 regional servers +
central share. Exact numbers need a real count first.

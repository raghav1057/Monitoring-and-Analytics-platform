"""Small checks: skip double events, find wanted vehicles, pick danger level."""

from datetime import datetime, timezone, timedelta


def _as_naive(dt: datetime) -> datetime:
    if dt is not None and dt.tzinfo is not None:
        return dt.astimezone(timezone.utc).replace(tzinfo=None)
    return dt


def is_duplicate(last_time, new_time, window_s: int = 60) -> bool:
    """Same car twice within 60 seconds = one event, not two."""
    if not last_time or not new_time:
        return False
    return abs((_as_naive(new_time) - _as_naive(last_time)).total_seconds()) < window_s


def find_match(db, vehicle_number: str):
    """Is this number on the wanted list and still active?"""
    if not vehicle_number:
        return None
    from database import Watchlist
    return db.query(Watchlist).filter(
        Watchlist.entity_identifier == vehicle_number,
        Watchlist.status == "Active",
    ).first()


def danger_level(confidence: float, category: str) -> str:
    """HIGH / MEDIUM / LOW for the dashboard badge."""
    cat = (category or "").lower()
    if cat in ("stolen", "wanted") or (confidence or 0) >= 0.9:
        return "HIGH"
    if (confidence or 0) >= 0.7:
        return "MEDIUM"
    return "LOW"

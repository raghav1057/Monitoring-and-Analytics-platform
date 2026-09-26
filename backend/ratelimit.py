"""Tiny spam guard. No extra install.

Only protects the login page: max 5 tries per minute per address.
Uses memory, so it resets on restart — fine for this stage.
"""

import time
from collections import defaultdict

_hits: dict[str, list[float]] = defaultdict(list)

MAX_TRIES = 5
WINDOW_S = 60


def allowed(key: str) -> bool:
    now = time.time()
    recent = [t for t in _hits[key] if now - t < WINDOW_S]
    _hits[key] = recent
    if len(recent) >= MAX_TRIES:
        return False
    recent.append(now)
    return True

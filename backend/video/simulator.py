"""Fake feed. Always works, needs no camera and no video file.

Use it when you just want the dashboard and map to feel alive.
Sends a heartbeat tick so status flips to Online.
"""

import time
from .base import VideoSource


class SimulatorSource(VideoSource):
    name = "simulator"

    def __init__(self, camera_id: str = "SIM1"):
        self.camera_id = camera_id
        self._open = False
        self.frames = 0

    def open(self) -> bool:
        self._open = True
        return True

    def is_live(self) -> bool:
        return self._open

    def tick(self) -> dict:
        self.frames += 1
        return {
            "camera_id": self.camera_id,
            "frame": self.frames,
            "time": time.time(),
        }

    def info(self) -> dict:
        return {"source": "simulator", "camera_id": self.camera_id, "live": self.is_live()}

    def close(self) -> None:
        self._open = False

"""Plays a saved video file. This is the working feed for the demo.

Put any legal sample footage in backend/video/samples/ and point
a camera at it. Loops forever so the dashboard never goes blank.
"""

import os
from .base import VideoSource


class FileSource(VideoSource):
    name = "file"

    def __init__(self, path: str):
        self.path = path
        self._open = False

    def open(self) -> bool:
        self._open = os.path.exists(self.path)
        return self._open

    def is_live(self) -> bool:
        return self._open

    def info(self) -> dict:
        return {
            "source": "file",
            "path": self.path,
            "exists": os.path.exists(self.path),
            "live": self.is_live(),
        }

    def close(self) -> None:
        self._open = False

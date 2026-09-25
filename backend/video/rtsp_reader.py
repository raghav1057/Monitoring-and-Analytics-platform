"""Real camera slot. Same shape as file/simulator, so going live
later means only changing the URL, nothing else.

Needs `opencv-python` only when you use a true rtsp:// URL.
Without it (or without a camera), it simply reports not-live
instead of crashing the app.
"""

from .base import VideoSource


class RTSPSource(VideoSource):
    name = "rtsp"

    def __init__(self, url: str):
        self.url = url
        self._open = False

    def open(self) -> bool:
        try:
            import cv2  # needed only for real RTSP
        except ImportError:
            self._open = False
            return False
        try:
            cap = cv2.VideoCapture(self.url)
            ok = cap.isOpened()
            cap.release()
            self._open = bool(ok)
            return self._open
        except Exception:
            self._open = False
            return False

    def is_live(self) -> bool:
        return self._open

    def info(self) -> dict:
        return {"source": "rtsp", "url_host": self.url.split("@")[-1] if "@" in self.url else "hidden", "live": self.is_live()}

    def close(self) -> None:
        self._open = False


def make_source(protocol: str, endpoint: str) -> VideoSource:
    """Pick the right reader by protocol name. Defaults to file."""
    protocol = (protocol or "file").lower()
    if protocol == "rtsp":
        return RTSPSource(endpoint)
    if protocol == "simulator":
        from .simulator import SimulatorSource
        return SimulatorSource(camera_id=endpoint or "SIM1")
    from .file_reader import FileSource
    return FileSource(endpoint)

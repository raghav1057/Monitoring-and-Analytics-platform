"""One shape for all camera feeds.

A file video, a fake feed, or a real RTSP camera all look the same
to the rest of the app. That is how pre-recorded today becomes
live tomorrow: only the source changes, nothing else.
"""


class VideoSource:
    name = "base"

    def open(self) -> bool:
        raise NotImplementedError

    def is_live(self) -> bool:
        raise NotImplementedError

    def info(self) -> dict:
        raise NotImplementedError

    def close(self) -> None:
        raise NotImplementedError

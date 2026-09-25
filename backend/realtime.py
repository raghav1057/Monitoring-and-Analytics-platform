from fastapi import WebSocket

class Hub:
    def __init__(self):
        self.channels: dict[str, set[WebSocket]] = {"events": set(), "alerts": set()}

    async def connect(self, channel: str, ws: WebSocket):
        await ws.accept()
        self.channels.setdefault(channel, set()).add(ws)

    def disconnect(self, channel: str, ws: WebSocket):
        if ws in self.channels.get(channel, set()):
            self.channels[channel].remove(ws)

    async def broadcast(self, channel: str, message: dict):
        dead = []
        for ws in list(self.channels.get(channel, set())):
            try:
                await ws.send_json(message)
            except Exception:
                dead.append(ws)
        for ws in dead:
            self.disconnect(channel, ws)


hub = Hub()

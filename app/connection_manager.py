import logging

from fastapi import HTTPException, WebSocket

logger = logging.getLogger(__name__)

class ConnectionManager:
    def __init__(self) -> None:
        self.active: dict[str, list[WebSocket]] = {}

    async def connect(self, user_id: str, websocket: WebSocket) -> None:
        await websocket.accept()
        self.active.setdefault(user_id, []).append(websocket)

    def disconnect(self, user_id: str, websocket: WebSocket) -> None:
        conns = self.active.get(user_id)
        if conns and websocket in conns:
            conns.remove(websocket)
        if conns == []:
            self.active.pop(user_id, None)

    # Send a payload to all active connections of a user
    async def send_to_user(self, user_id: str, payload: dict) -> None:
        for ws in list(self.active.get(user_id, [])):
            try:
                await ws.send_json(payload)
            except Exception as e:
                logger.exception(f"Error sending message to {user_id}: {e}")
                self.disconnect(user_id, ws)

manager = ConnectionManager()

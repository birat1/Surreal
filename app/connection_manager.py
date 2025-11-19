import logging

from fastapi import HTTPException, WebSocket

from app.config import VALID_USERS

logger = logging.getLogger(__name__)

class ConnectionManager:
    def __init__(self) -> None:
        self.active: dict[str, list[WebSocket]] = {}

    async def connect(self, username: str, websocket: WebSocket) -> None:
        if username not in VALID_USERS:
            raise HTTPException(status_code=404, detail="unknown user")
        await websocket.accept()
        self.active.setdefault(username, []).append(websocket)

    def disconnect(self, username: str, websocket: WebSocket) -> None:
        conns = self.active.get(username)
        if conns and websocket in conns:
            conns.remove(websocket)
        if conns == []:
            self.active.pop(username, None)

    # Send a payload to all active connections of a user
    async def send_to_user(self, username: str, payload: dict) -> None:
        for ws in list(self.active.get(username, [])):
            try:
                await ws.send_json(payload)
            except Exception as e:
                logger.exception(f"Error sending message to {username}: {e}")

                try:
                    ws.close()
                except RuntimeError:
                    pass
                except Exception as close_error:
                    logger.warning(f"Error closing WebSocket for {username}: {close_error}")
                self.disconnect(username, ws)

manager = ConnectionManager()

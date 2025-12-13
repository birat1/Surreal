import logging

from fastapi import WebSocket, WebSocketDisconnect

logger = logging.getLogger(__name__)

class ConnectionManager:
    def __init__(self) -> None:
        """Initialise an empty active connections dictionary."""
        self.active: dict[str, list[WebSocket]] = {}

    async def connect(self, user_id: str, websocket: WebSocket) -> None:
        """Accept a new WebSocket connection and add it to the active connections."""
        await websocket.accept()
        self.active.setdefault(user_id, []).append(websocket)

    def disconnect(self, user_id: str, websocket: WebSocket) -> None:
        """Remove a WebSocket connection from the active connections."""
        conns = self.active.get(user_id)
        if conns and websocket in conns:
            conns.remove(websocket)
        if conns == []:
            self.active.pop(user_id, None)

    # Send a payload to all active connections of a user
    async def send_to_user(self, user_id: str, payload: dict) -> None:
        """Send a JSON payload to all active WebSocket connections for a user."""
        active_sockets = self.active.get(user_id, [])[:]

        for ws in list(active_sockets):
            try:
                await ws.send_json(payload)
            except (WebSocketDisconnect, RuntimeError):
                self.disconnect(user_id, ws)
            except Exception as e:
                logger.exception(f"Error sending message to {user_id}: {e}")
                self.disconnect(user_id, ws)

manager = ConnectionManager()

import datetime
import logging
from uuid import uuid4

from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from app.config import VALID_USERS
from app.connection_manager import manager
from app.db import conv_id, get_messages
import contextlib

logger = logging.getLogger(__name__)

router = APIRouter()

@router.websocket("/ws/{username}")
async def websocket_endpoint(websocket: WebSocket, username: str) -> None:
    if username not in VALID_USERS:
        await websocket.close(code=1008)
        return

    await manager.connect(username, websocket)
    messages = get_messages()

    try:
        while True:
            data = await websocket.receive_json()
            body = (data.get("body") or "").strip()
            recipient = (data.get("recipient") or "").strip()

            if not body:
                continue
            if recipient not in VALID_USERS:
                await manager.send_to_user(username, {"type": "error", "message": "Unknown recipient"})
                continue
            if recipient == username:
                await manager.send_to_user(username, {"type": "error", "message": "Cannot send message to self"})
                continue

            # Store the message
            cid = conv_id(username, recipient)
            now = datetime.datetime.now(datetime.timezone.utc).strftime("%H:%M:%S %d/%m/%y")

            msg = {
                "type": "message",
                "id": str(uuid4()),
                "conversation_id": cid,
                "sender": username,
                "recipient": recipient,
                "body": body,
                "created_at": now,
            }
            messages.setdefault(cid, []).append(msg)

            # Only between sender and recipient (left=sender, right=recipient)
            await manager.send_to_user(username, {**msg, "side": "left"})
            await manager.send_to_user(recipient, {**msg, "side": "right"})

    except WebSocketDisconnect:
        logger.info(f"WebSocket disconnected: {username}")
    except Exception as e:
        logger.exception(f"Error in WebSocket connection for {username}: {e}")
        with contextlib.suppress(RuntimeError):
            await websocket.close()
    finally:
        manager.disconnect(username, websocket)

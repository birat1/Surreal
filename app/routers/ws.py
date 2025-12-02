import contextlib
import datetime
import logging

from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from pydantic import ValidationError

from app.config import VALID_USERS
from app.connection_manager import manager
from app.db import conv_id
from app.models import Conversation, Message
from app.schemas import MessageCreate

logger = logging.getLogger(__name__)

router = APIRouter()

@router.websocket("/ws/{username}")
async def websocket_endpoint(websocket: WebSocket, username: str) -> None:
    if username not in VALID_USERS:
        await websocket.close(code=1008)
        return

    await manager.connect(username, websocket)

    try:
        while True:
            raw_data = await websocket.receive_json()

            try:
                data = MessageCreate(**raw_data)
            except ValidationError as e:
                await manager.send_to_user(username, {"type": "error", "details": e.errors()})
                continue

            if data.recipient not in VALID_USERS:
                await manager.send_to_user(username, {"type": "error", "message": "Unknown recipient"})
                continue
            if data.recipient == username:
                await manager.send_to_user(username, {"type": "error", "message": "Cannot send message to self"})
                continue

            # Store the message
            cid = conv_id(username, data.recipient)

            new_msg = Message(
                conversation_id=cid,
                sender=username,
                recipient=data.recipient,
                body=data.body,
            )

            await new_msg.insert()

            # Update conversation metadata
            await Conversation.find_one(Conversation.id == cid).upsert(
                {
                    "$set": {
                        "last_msg": data.body[:100],
                        "last_sender": username,
                        "updated_at": datetime.datetime.now(datetime.timezone.utc),
                        "participants": [username, data.recipient],
                    },
                },
                on_insert=Conversation(
                    id=cid,
                    participants=[username, data.recipient],
                    last_msg=data.body[:100],
                    last_sender=username,
                    updated_at=datetime.datetime.now(datetime.timezone.utc),
                ),
            )

            response_dict = new_msg.model_dump(mode="json")

            await manager.send_to_user(username, response_dict)
            await manager.send_to_user(data.recipient, response_dict)
    except WebSocketDisconnect:
        logger.info(f"WebSocket disconnected: {username}")
    except Exception as e:
        logger.exception(f"Error in WebSocket connection for {username}: {e}")
        with contextlib.suppress(RuntimeError):
            await websocket.close()
    finally:
        manager.disconnect(username, websocket)

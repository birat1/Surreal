import contextlib
import datetime
import logging
from uuid import uuid4

from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from pydantic import ValidationError

from app.config import VALID_USERS
from app.connection_manager import manager
from app.db import AsyncSessionLocal, conv_id
from app.models import Message
from app.schemas import MessageCreate, MessageResponse

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
                id=str(uuid4()),
                conversation_id=cid,
                sender=username,
                recipient=data.recipient,
                body=data.body,
                created_at=datetime.datetime.now(datetime.timezone.utc),
            )

            async with AsyncSessionLocal() as session:
                session.add(new_msg)
                await session.commit()
                await session.refresh(new_msg)

            response_model = MessageResponse.model_validate(new_msg)
            response_dict = response_model.model_dump(mode="json")

            # Only between sender and recipient (left=sender, right=recipient)
            await manager.send_to_user(username, {**response_dict, "side": "left"})
            await manager.send_to_user(data.recipient, {**response_dict, "side": "right"})
    except WebSocketDisconnect:
        logger.info(f"WebSocket disconnected: {username}")
    except Exception as e:
        logger.exception(f"Error in WebSocket connection for {username}: {e}")
        with contextlib.suppress(RuntimeError):
            await websocket.close()
    finally:
        manager.disconnect(username, websocket)

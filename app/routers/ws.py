import contextlib
import datetime
import logging
import os

import httpx
from fastapi import APIRouter, Query, WebSocket, WebSocketDisconnect
from pydantic import ValidationError

from app.connection_manager import manager
from app.db import conv_id
from app.models import Conversation, Message
from app.schemas import MessageCreate
from app.utils.jwt_handler import get_ws_user_id

logger = logging.getLogger(__name__)

router = APIRouter()

USER_AUTH_SERVICE_URL = os.getenv("USER_AUTH_SERVICE_URL")

async def fetch_names_from_auth_service(user_ids: list[str]) -> dict[str, str]:
    """Get names from user-auth-service given a list of user IDs."""
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{USER_AUTH_SERVICE_URL}/users/retrieve",
                json={"user_ids": user_ids},
            )
            if response.status_code == 200:
                return response.json()
    except Exception as e:
        logger.error(f"Error fetching names from auth service: {e}")
    return {}

@router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket, token: str = Query(...)) -> None:
    # Authenicate via JWT
    user_id = await get_ws_user_id(token)

    if user_id is None:
        await websocket.close(code=1008)
        return

    user_id_str = str(user_id)

    await manager.connect(user_id_str, websocket)

    try:
        while True:
            raw_data = await websocket.receive_json()

            try:
                data = MessageCreate(**raw_data)
            except ValidationError as e:
                await manager.send_to_user(user_id_str, {"type": "error", "details": e.errors()})
                continue

            recipient_id_str = str(data.recipient_id)

            if recipient_id_str == user_id_str:
                await manager.send_to_user(user_id_str, {"type": "error", "message": "Cannot send message to self"})
                continue

            # Store the message
            cid = conv_id(user_id_str, recipient_id_str)

            names_dict = await fetch_names_from_auth_service([user_id_str, recipient_id_str])

            new_msg = Message(
                conversation_id=cid,
                sender_id=user_id,
                recipient_id=data.recipient_id,
                body=data.body,
            )

            await new_msg.insert()

            # Update conversation metadata
            curr_time = datetime.datetime.now(datetime.timezone.utc)
            await Conversation.find_one(Conversation.id == cid).upsert(
                {
                    "$set": {
                        "last_msg": data.body[:100],
                        "last_sender_id": user_id,
                        "updated_at": curr_time,
                        "participant_names": names_dict,
                    },
                    "$addToSet": {
                        "participants": {"$each": [user_id, data.recipient_id]},
                    },
                },
                on_insert=Conversation(
                    id=cid,
                    participants=[user_id, data.recipient_id],
                    participant_names=names_dict,
                    last_msg=data.body[:100],
                    last_sender_id=user_id,
                    updated_at=curr_time,
                ),
            )

            response_dict = new_msg.model_dump(mode="json")

            await manager.send_to_user(user_id_str, response_dict)
            await manager.send_to_user(recipient_id_str, response_dict)
    except WebSocketDisconnect:
        logger.info(f"WebSocket disconnected: {user_id_str}")
    except Exception as e:
        logger.exception(f"Error in WebSocket connection for {user_id_str}: {e}")
        with contextlib.suppress(RuntimeError):
            await websocket.close()
    finally:
        manager.disconnect(user_id_str, websocket)

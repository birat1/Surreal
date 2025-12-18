import contextlib
import datetime
import logging
import os
from uuid import UUID, uuid4

import httpx
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from pydantic import ValidationError

from app.connection_manager import manager
from app.models import Conversation, Message
from app.schemas import MessageCreate
from app.utils.jwt_handler import get_ws_user_id
from app.utils.rabbitmq_publisher import publisher

logger = logging.getLogger(__name__)

router = APIRouter()

USER_AUTH_SERVICE_URL = os.getenv("USER_AUTH_SERVICE_URL")

async def fetch_names_from_auth_service(user_ids: list[str]) -> dict[str, str]:
    """Get names from user-auth-service given a list of user IDs."""
    try:
        async with httpx.AsyncClient() as client:
            # Make request to user-auth-service to get userid-name mapping
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
async def websocket_endpoint(websocket: WebSocket) -> None:
    # Authenicate via JWT
    token = websocket.cookies.get("access_token")

    user_id = await get_ws_user_id(token)

    if user_id is None:
        await websocket.close(code=1008)
        return

    user_id_str = str(user_id)

    await manager.connect(user_id_str, websocket)

    try:
        while True:
            # Receive and validate incoming message
            raw_data = await websocket.receive_json()

            # Check for read receipt
            if raw_data.get("type") == "read_receipt":
                try:
                    # ID of the sender whose message has been read
                    sender_id_message = raw_data["sender_id"]

                    # Find existing conversation via participants
                    conversation = await Conversation.find_one({
                        "participants": {
                            "$all": [UUID(user_id_str), UUID(sender_id_message)],
                        },
                    })

                    if not conversation:
                        logger.warning(f"Conversation not found for read receipt: {user_id_str} and {sender_id_message}")
                        continue

                    cid = conversation.id

                    curr_time = datetime.datetime.now(datetime.timezone.utc)

                    # Update all messages sent to user_id from sender_id as read
                    await Message.find({
                        "conversation_id": cid,
                        "recipient_id": UUID(user_id_str),
                        "read_at": None,
                    }).update({"$set": {"read_at": curr_time}})

                    # Create read event and publish to message broker
                    read_at = int(datetime.datetime.now(datetime.timezone.utc).timestamp())
                    read_event = {
                        "eventType": "MessageRead",
                        "messageRead": {
                            "conversationId": cid,
                            "readerId": user_id_str,
                            "readAt": read_at,
                        }
                    }
                    await publisher.publish_event(read_event)

                    # Notify the original sender about the read receipt
                    await manager.send_to_user(sender_id_message, {
                        "type": "read_receipt",
                        "reader_id": user_id_str,
                        "read_at": str(curr_time),
                    })
                except KeyError:
                    pass
                continue

            try:
                data = MessageCreate(**raw_data)
            except ValidationError as e:
                await manager.send_to_user(user_id_str, {"type": "error", "details": e.errors()})
                continue

            recipient_id_str = str(data.recipient_id)

            if recipient_id_str == user_id_str:
                await manager.send_to_user(user_id_str, {"type": "error", "message": "Cannot send message to self"})
                continue

            # Find existing conversation via participants
            conversation = await Conversation.find_one({
                "participants": {
                    "$all": [UUID(user_id_str), UUID(recipient_id_str)],
                },
            })

            if conversation:
                # Use existing conversation
                cid = conversation.id
                names_dict = conversation.participant_names

                if not all(uid in names_dict for uid in [user_id_str, recipient_id_str]):
                    names_dict = await fetch_names_from_auth_service([user_id_str, recipient_id_str])
            else:
                # Create new conversation if none exists
                cid = uuid4()
                names_dict = await fetch_names_from_auth_service([user_id_str, recipient_id_str])
                conversation = Conversation(
                    id = cid,
                    participants = [UUID(user_id_str), UUID(recipient_id_str)],
                    participant_names = names_dict,
                    last_msg = data.body,
                    last_sender_id = user_id,
                    updated_at = datetime.datetime.now(datetime.timezone.utc),
                )
                await conversation.insert()

            # Create and insert new message document
            new_msg = Message(
                conversation_id=cid,
                sender_id=user_id,
                recipient_id=data.recipient_id,
                body=data.body,
            )

            await new_msg.insert()

            message_id = str(uuid4())
            time_stamp = int(datetime.datetime.now(datetime.timezone.utc).timestamp())
            sender_username = names_dict.get(user_id_str, "unknown")
            created_event = {
                "eventType": "MessageCreated",
                "messageCreated":{
                    "messageId": message_id,
                    "conversationId": cid,
                    "senderId": str(user_id),
                    "senderUsername": sender_username,
                    "recipientId": str(data.recipient_id),
                    "preview": data.body[:30],
                    "timeStamp": time_stamp,
                },
            }
            await publisher.publish_event(created_event)

            # Update conversation metadata
            curr_time = datetime.datetime.now(datetime.timezone.utc)

            conversation.last_msg = data.body
            conversation.last_sender_id = user_id
            conversation.updated_at = curr_time
            conversation.participant_names = names_dict

            # Ensure both participants are in the conversation
            if user_id not in conversation.participants:
                conversation.participants.append(user_id)
            if data.recipient_id not in conversation.participants:
                conversation.participants.append(data.recipient_id)

            await conversation.save()

            # Prepare response payload
            response_dict = new_msg.model_dump(mode="json")
            sender_name = names_dict.get(user_id_str, "Unknown")
            response_dict["sender_name"] = sender_name

            # Send the new message to both sender and recipient
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

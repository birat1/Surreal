from fastapi import APIRouter, HTTPException

from app.config import VALID_USERS
from app.models import Conversation, Message

router = APIRouter()

# Inbox endpoint
@router.get("/{username}/inbox")
async def get_user_inbox(username: str):
    """Get the inbox for a user, listing all conversations they are a part of."""
    if username not in VALID_USERS:
        raise HTTPException(status_code=404, detail="Unknown user")

    conversations = await Conversation.find(
        Conversation.participants == username
    ).sort("-updated_at").to_list()

    inbox_list = []
    for c in conversations:
        other_user = c.participants[0] if c.participants[1] == username else c.participants[1]

        inbox_list.append({
            "id": c.id,
            "recipient": other_user,
            "last_message": c.last_msg,
            "last_sender": c.last_sender,
            "updated_at": c.updated_at,
        })

    return {"conversations": inbox_list}

# Messages in a conversation endpoint
@router.get("/conversations/{conversation_id}/messages")
async def get_conversation(conversation_id: str):
    """Fetch all messages in a conversation."""
    # If no message exists, return empty list
    # Handles empty screen on first chat open
    messages = await Message.find(
        Message.conversation_id == conversation_id
    ).sort("+created_at").to_list()

    return [msg.model_dump(mode="json") for msg in messages]

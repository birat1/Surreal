from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException

from app.models import Conversation, Message
from app.utils.jwt_handler import get_current_user

router = APIRouter()

# Inbox endpoint
@router.get("/inbox")
async def get_user_inbox(current_user: Annotated[str, Depends(get_current_user)]):
    """Get the inbox for a user, listing all conversations they are a part of."""
    user_id = UUID(current_user)

    conversations = await Conversation.find(
        Conversation.participants == user_id
    ).sort("-updated_at").to_list()

    inbox_list = []
    for c in conversations:
        others = [p for p in c.participants if p != user_id]

        if not others:
            continue

        other_user_id = others[0]

        display_name = c.participant_names.get(str(other_user_id), "Unknown User")

        inbox_list.append({
            "id": c.id,
            "recipient_id": str(other_user_id),
            "recipient_name": display_name,
            "last_message": c.last_msg,
            "last_sender_id": str(c.last_sender_id) if c.last_sender_id else None,
            "updated_at": c.updated_at,
        })

    return {"conversations": inbox_list}

# Messages in a conversation endpoint
@router.get("/conversations/{conversation_id}/messages")
async def get_conversation(conversation_id: str, current_user: Annotated[str, Depends(get_current_user)]):
    """Fetch all messages in a conversation."""

    user_id = UUID(current_user)

    # Fetch the conversation
    conversation = await Conversation.get(conversation_id)

    # Validate conversation existence and user participation
    if not conversation:
        if current_user not in conversation_id:
            raise HTTPException(status_code=403, detail="You are not a participant in this conversation")
        return []

    if user_id not in conversation.participants:
        raise HTTPException(status_code=403, detail="You are not a participant in this conversation")

    # Fetch messages in the conversation
    messages = await Message.find(
        Message.conversation_id == conversation_id
    ).sort("+created_at").to_list()

    return [msg.model_dump(mode="json") for msg in messages]

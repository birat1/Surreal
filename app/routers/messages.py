from typing import Annotated

from fastapi import APIRouter, HTTPException, Query

from app.config import VALID_USERS
from app.db import conv_id
from app.models import Conversation, Message

router = APIRouter()

@router.get("/{username}/messages")
async def get_users_messages(
        username: str,
        recipient: Annotated[str | None, Query()] = None,
    ):
    """
    Get messages for a user. 
    - if recipient is provided: returns the conversation with that person.
    - if no recipient is provided: returns list of people the user has chatted with.
    """
    if username not in VALID_USERS:
        raise HTTPException(status_code=404, detail="Unknown user")

    # If recipient is provided, get conversation messages
    if recipient:
        if recipient not in VALID_USERS:
            raise HTTPException(status_code=404, detail="Recipient does not exist.")

        cid = conv_id(username, recipient)

        messages = await Message.find(
            Message.conversation_id == cid
        ).sort("+created_at").to_list()

        return [msg.model_dump(mode="json") for msg in messages]

    # If recipient is not provided, get conversations
    conversations = await Conversation.find(
        Conversation.participants == username
    ).sort("-updated_at").to_list()

    inbox_list = []
    for c in conversations:
        other_user = c.participants[0] if c.participants[1] == username else c.participants[1]

        inbox_list.append({
            "recipient": other_user,
            "last_message": c.last_message,
            "last_sender": "You" if c.last_sender == username else other_user,
            "updated_at": c.updated_at,
        })

    return {"user": username, "conversations": inbox_list}

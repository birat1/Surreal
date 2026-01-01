from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException

from app.models import Conversation, Message
from app.utils.jwt_handler import get_current_user

router = APIRouter()


# Inbox endpoint
@router.get("/inbox")
async def get_user_inbox(current_user: Annotated[str, Depends(get_current_user)]) -> dict:
    """Get the inbox for a user, listing all conversations they are a part of."""
    user_id = UUID(current_user)

    # Fetch conversations involving the user
    conversations = (
        await Conversation.find(
            Conversation.participants == user_id  # noqa: COM812
        )
        .sort("-updated_at")
        .to_list()
    )

    inbox_list = []
    for c in conversations:
        # Identify the other participant(s) in the conversation
        others = [p for p in c.participants if p != user_id]

        # Skip if no other participants found (should not happen in valid data)
        if not others:
            continue

        # 1-to-1 conversation assumption (for now??)
        other_user_id = others[0]

        # Get display name for the other participant
        display_name = c.participant_names.get(str(other_user_id), "Unknown User")

        # Append conversation details to inbox list
        inbox_list.append(
            {
                "id": c.id,
                "recipient_id": str(other_user_id),
                "recipient_name": display_name,
                "last_message": c.last_msg,
                "last_sender_id": str(c.last_sender_id) if c.last_sender_id else None,
                "updated_at": c.updated_at,
            },
        )

    # Return the compiled inbox list
    return {"conversations": inbox_list}


# Messages in a conversation endpoint
@router.get("/conversations/{conversation_id}/messages")
async def get_conversation(
    conversation_id: UUID,
    current_user: Annotated[str, Depends(get_current_user)],
) -> list[dict]:
    """Fetch all messages in a conversation."""
    user_id = UUID(current_user)

    # Fetch the conversation
    conversation = await Conversation.get(conversation_id)

    # Verify user participation in the conversation
    if conversation:
        if user_id not in conversation.participants:
            raise HTTPException(status_code=403, detail="Access denied to this conversation")
    else:
        return []

    # Fetch messages in the conversation
    messages = (
        await Message.find(
            Message.conversation_id == conversation_id  # noqa: COM812
        )
        .sort("+created_at")
        .to_list()
    )

    # Return messages as JSON dicts
    return [msg.model_dump(mode="json") for msg in messages]

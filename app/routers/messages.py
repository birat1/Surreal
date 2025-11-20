from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import VALID_USERS
from app.db import conv_id, get_db
from app.models import Message
from app.schemas import MessageResponse

router = APIRouter()

@router.get("/{username}/messages")
async def get_users_messages(
        username: str,
        recipient: Annotated[str | None, Query()] = None,
        db: AsyncSession = Depends(get_db)
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

        stmt = (
            select(Message)
            .where(Message.conversation_id == cid)
            .order_by(Message.created_at.asc())
        )
        result = await db.execute(stmt)
        db_messages = result.scalars().all()

        response_data = []
        for msg in db_messages:
            pydantic_model = MessageResponse.model_validate(msg)
            data = pydantic_model.model_dump(mode="json")

            data["side"] = "left" if msg.sender == username else "right"
            response_data.append(data)

        return response_data

    # If recipient is not provided, get conversations
    stmt = (
        select(Message)
        .where(or_(Message.sender == username, Message.recipient == username))
        .order_by(Message.created_at.desc())
    )
    result = await db.execute(stmt)
    all_msgs = result.scalars().all()

    contacts = []
    seen = set()

    for msg in all_msgs:
        partner = msg.recipient if msg.sender == username else msg.sender

        if partner not in seen:
            contacts.append(partner)
            seen.add(partner)

    return {"user": username, "recipients": contacts}

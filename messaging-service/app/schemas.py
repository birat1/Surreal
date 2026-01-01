from datetime import datetime

from pydantic import UUID4, BaseModel, ConfigDict, Field


class MessageCreate(BaseModel):
    """Schema for creating a message."""

    recipient_id: UUID4
    body: str = Field(..., min_length=1)


class MessageResponse(BaseModel):
    """Schema for message response."""

    id: UUID4
    conversation_id: str
    sender: str
    recipient: str
    body: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

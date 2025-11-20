from pydantic import BaseModel, UUID4, Field
from datetime import datetime

class MessageCreate(BaseModel):
    recipient: str
    body: str = Field(..., min_length=1)

class MessageResponse(BaseModel):
    id: UUID4
    conversation_id: str
    sender: str
    recipient: str
    body: str
    created_at: datetime

    class Config:
        from_attributes = True

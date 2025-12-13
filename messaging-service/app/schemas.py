from pydantic import BaseModel, UUID4, Field, ConfigDict
from datetime import datetime

class MessageCreate(BaseModel):
    recipient_id: UUID4
    body: str = Field(..., min_length=1)

class MessageResponse(BaseModel):
    id: UUID4
    conversation_id: str
    sender: str
    recipient: str
    body: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

from datetime import datetime, timezone
from uuid import UUID, uuid4

from beanie import Document, Indexed
from pydantic import Field


class Message(Document):
    id: UUID = Field(default_factory=uuid4)
    conversation_id: str = Indexed()
    sender: str
    recipient: str
    body: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "messages"

class Conversation(Document):
    id: str
    participants: list[str] = Indexed()
    last_msg: str
    last_sender: str
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "conversations"

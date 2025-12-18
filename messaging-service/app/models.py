from datetime import datetime, timezone
from uuid import UUID, uuid4

from beanie import Document, Indexed
from pydantic import UUID4, Field


class Message(Document):
    """Message model."""

    id: UUID = Field(default_factory=uuid4)
    sender_id: UUID4
    recipient_id: UUID4

    conversation_id: UUID = Indexed()
    body: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    read_at: datetime | None = None

    class Settings:
        name = "messages"

class Conversation(Document):
    """Conversation model."""

    id: UUID = Field(default_factory=uuid4)

    participants: list[UUID4]
    participant_names: dict[str, str]

    last_msg: str
    last_sender_id: UUID4
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "conversations"

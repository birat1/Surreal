import datetime

from sqlalchemy import Column, DateTime, String, Text

from app.db import Base


class Message(Base):
    __tablename__ = "messages"

    id = Column(String, primary_key=True, index=True)
    conversation_id = Column(String, index=True)
    sender = Column(String, index=True)
    recipient = Column(String, index=True)
    body = Column(Text)
    created_at = Column(DateTime(timezone=True), default=datetime.datetime.now(datetime.timezone.utc))

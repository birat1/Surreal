from sqlalchemy import Column, Date, ForeignKey, Integer, String, Time
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.database import Base


class Events(Base):
    """Events table definition."""

    __tablename__ = "events"

    id = Column(Integer, primary_key=True, index=True)
    name_of_event = Column(String, nullable=False)
    event_date = Column(Date, nullable=False)
    event_time = Column(Time, nullable=False)
    event_location = Column(String, nullable=False)
    event_organiser = Column(String, nullable=False)

    attendee_ids = relationship(
        "EventRSVP",
        back_populates="event",
        cascade="all, delete",
    )


class EventRSVP(Base):
    """EventRSVP table definition."""

    __tablename__ = "event_rsvps"

    user_id = Column(UUID(as_uuid=True), primary_key=True)
    event_id = Column(Integer, ForeignKey("events.id"), primary_key=True)

    event = relationship("Events", back_populates="attendee_ids")

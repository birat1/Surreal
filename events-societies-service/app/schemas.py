from datetime import date, time

from pydantic import BaseModel


class Attendee(BaseModel):
    """Attendee schema."""

    user_id: str
    username: str


# schema for events
class EventCreate(BaseModel):
    """Event creation schema."""

    name_of_event: str
    event_date: date
    event_time: time
    event_location: str
    event_organiser: str


class EventRead(EventCreate):
    """Event read schema."""

    id: int
    attendees: list[Attendee] = []

    class Config:
        """Configuration for Pydantic model."""

        from_attributes = True

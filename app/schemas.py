from datetime import date, time

from pydantic import BaseModel


class Attendee(BaseModel):
    user_id: str
    username: str


# schema for events
class EventCreate(BaseModel):
    name_of_event: str
    event_date: date
    event_time: time
    event_location: str
    event_organiser: str


class EventRead(EventCreate):
    id: int
    attendees: list[Attendee] = []

    class Config:
        from_attributes = True

import logging
import os
from typing import Annotated

import httpx
from fastapi import APIRouter, Depends, FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from jose import JWTError, jwt
from sqlalchemy import asc
from sqlalchemy.orm import Session

from app import models
from app.database import SessionLocal, engine
from app.models import EventRSVP, Events
from app.schemas import EventCreate, EventRead

app = FastAPI()


router = APIRouter()

# CORS settings
origins = [
    "http://localhost:5173",  # frontend URL,
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware, allow_origins=origins, allow_credentials=True, allow_methods=["*"], allow_headers=["*"]
)


def get_db():
    """Get a database session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


db_dependency = Annotated[Session, Depends(get_db)]


# This will create all tables defined in models.py if they don't exist, it does this as soon as the backend server is started
models.Base.metadata.create_all(bind=engine)

logger = logging.getLogger(__name__)

router = APIRouter()

USER_AUTH_SERVICE_URL = os.getenv("USER_AUTH_SERVICE_URL")

SECRET_KEY = os.getenv("JWT_SECRET")
ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")


# gets data from other database (used for match and create events features)
def get_current_user(request: Request) -> dict:
    """Handle JWT validation and returns UserID as string."""
    token = request.cookies.get("access_token")

    if not token:
        logger.debug("No token found in cookies")
        raise HTTPException(status_code=401, detail="Not authenticated")

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        is_admin = payload.get("is_admin")

        if user_id is None:
            logger.debug("Token payload missing 'sub'")
            raise HTTPException(status_code=401, detail="Invalid token payload")

        return {
            "user_id": user_id,
            "is_admin": is_admin,
        }
    except JWTError as e:
        logger.debug(f"JWTError occurred - {e}")
        logger.debug(f"Token value - {token[:10]}...")
        raise HTTPException(status_code=401, detail="Could not validate credentials") from e


# used for match events feature - attendees
async def fetch_names_from_auth_service(user_ids: list[str]) -> dict[str, str]:
    """Get names from user-auth-service given a list of user IDs."""
    try:
        async with httpx.AsyncClient() as client:
            # Make request to user-auth-service to get userid-name mapping
            response = await client.post(
                f"{USER_AUTH_SERVICE_URL}/users/retrieve",
                json={"user_ids": user_ids},
            )
            if response.status_code == 200:  # Successful response
                return response.json()
    except Exception as e:
        logger.exception(f"Error fetching names from auth service: {e}")
    return {}


@app.get("/")
def health() -> dict:
    """Health check endpoint."""
    return {"status": "ok"}


@app.get("/events", response_model=list[EventRead])
async def get_events(
    db: Annotated[Session, Depends(get_db)],
    organiser: str | None = None,
) -> list[Events]:
    """Get all events, optionally filtered by organiser."""
    query = db.query(Events)
    # filter by organiser
    if organiser:
        query = query.filter(Events.event_organiser.ilike(f"%{organiser}%"))

    # sort by date, then by time
    events = query.order_by(asc(Events.event_date), asc(Events.event_time)).all()

    for event in events:
        rsvps = db.query(EventRSVP).filter_by(event_id=event.id).all()
        user_ids = [str(r.user_id) for r in rsvps]
        user_map = await fetch_names_from_auth_service(user_ids)
        event.attendees = [{"user_id": uid, "username": user_map.get(uid, "Unknown")} for uid in user_ids]

    return events


@app.get("/events/{event_id}/attendees")
async def get_event_attendees(event_id: int, db: Annotated[Session, Depends(get_db)]) -> list[dict]:
    """Get attendees for a specific event."""
    rsvps = db.query(EventRSVP).filter_by(event_id=event_id).all()
    user_ids = [str(r.user_id) for r in rsvps]
    user_map = await fetch_names_from_auth_service(user_ids)

    return [{"user_id": uid, "username": user_map.get(uid, "Unknown")} for uid in user_ids]


@app.post("/events/{event_id}/rsvp")
def rsvp_event(
    event_id: int,
    db: Annotated[Session, Depends(get_db)],
    user: Annotated[dict, Depends(get_current_user)],
) -> dict:
    """RSVP to an event."""
    user_id = user["user_id"]

    existing = db.query(EventRSVP).filter_by(event_id=event_id, user_id=user_id).first()

    if existing:
        raise HTTPException(status_code=400, detail="Already RSVPed")

    rsvp = EventRSVP(event_id=event_id, user_id=user_id)
    db.add(rsvp)
    db.commit()

    return {"message": "RSVP successful"}


@app.post("/events", response_model=EventRead)
def create_event(
    event: EventCreate,
    db: Annotated[Session, Depends(get_db)],
    user: Annotated[dict, Depends(get_current_user)],
) -> Events:
    """Create a new event (Admins only)."""
    if not user["is_admin"]:
        raise HTTPException(status_code=403, detail="Admins only")

    new_event = Events(**event.model_dump())
    db.add(new_event)
    db.commit()
    db.refresh(new_event)

    return new_event

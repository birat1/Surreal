import os

from beanie import init_beanie
from pymongo import AsyncMongoClient

from app.models import Conversation, Message

DATABASE_URL = os.getenv("MESSAGE_DB_URL")

async def init_db() -> None:
    """Initialise the database connection."""
    client = AsyncMongoClient(DATABASE_URL)

    await init_beanie(
        database=client.messagedb,
        document_models=[Message, Conversation],
    )

import os

from beanie import init_beanie
from pymongo import AsyncMongoClient

from app.models import Conversation, Message

DATABASE_URL = os.getenv("DATABASE_URL")

async def init_db():
    client = AsyncMongoClient(DATABASE_URL)

    await init_beanie(
        database=client.messagedb,
        document_models=[Message, Conversation],
    )

def conv_id(user_a: str, user_b: str) -> str:
    return f"{min(user_a, user_b)}-{max(user_a, user_b)}"

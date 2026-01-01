from unittest.mock import AsyncMock

import pytest
from app.main import app
from app.models import Conversation, Message
from app.utils.jwt_handler import get_current_user
from beanie import init_beanie
from httpx import ASGITransport, AsyncClient
from motor.motor_asyncio import AsyncIOMotorClient


@pytest.fixture(autouse=True)
async def setup_test_db():
    """Mock MongoDB using an authenticated connection for tests."""
    DB_URL = "mongodb://user:pass@localhost:27017/test_db?authSource=admin"

    client = AsyncIOMotorClient(DB_URL)

    try:
        await init_beanie(database=client.test_db, document_models=[Message, Conversation])
        yield
    finally:
        # Clean up the test database after each test
        await client.drop_database("test_db")
        client.close()


@pytest.fixture(autouse=True)
def mock_rabbitmq(mocker):
    """Mock the RabbitMQ publisher globally."""
    return mocker.patch("app.utils.rabbitmq_publisher.publisher.publish_event", new_callable=AsyncMock)


@pytest.fixture
async def client():
    """Async client for testing FastAPI endpoints."""
    # Use ASGITransport to pass the FastAPI app
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac


@pytest.fixture
def mock_auth(mocker):
    """Override FastAPI dependency to simulate a logged-in user."""
    user_id = "550e8400-e29b-41d4-a716-446655440000"
    app.dependency_overrides[get_current_user] = lambda: user_id
    yield user_id
    app.dependency_overrides = {}

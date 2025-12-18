import asyncio
import os

import pytest
from app.db import init_db
from app.main import app
from httpx import ASGITransport, AsyncClient


@pytest.fixture(scope="session")
def event_loop():
    loop = asyncio.new_event_loop()
    yield loop
    loop.close()

@pytest.fixture(scope="session")
def test_settings():
    # Use env from GitLab CI or default to local test database

    os.environ.setdefault("JWT_SECRET", "testsecret")
    os.environ.setdefault("JWT_ALGORITHM", "HS256")
    os.environ.setdefault("USER_AUTH_SERVICE_URL", "http://mock-auth")

    db_url = os.getenv("DATABASE_URL", "mongodb://localhost:27017/testdb")
    os.environ["DATABASE_URL"] = db_url

    return os.environ


@pytest.fixture(scope="module")
async def test_client(test_settings):
    await init_db()

    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        yield client


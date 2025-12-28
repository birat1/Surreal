from unittest.mock import patch
from uuid import uuid4

import pytest
from app.main import app
from app.models import Conversation, Message
from app.utils.jwt_handler import jwt
from httpx import ASGITransport, AsyncClient


# Helper to create a test JWT
def create_test_token(user_id: str) -> str:
    # Uses the same secret used in your mock patches below
    return jwt.encode({"sub": user_id}, "ci_test_secret", algorithm="HS256")


@pytest.mark.asyncio
async def test_inbox(mock_rabbitmq):
    """
    1. Manually insert a conversation/message into the mock DB.
    2. Fetch Inbox via HTTP.
    3. Verify that the conversation appears correctly.
    """
    user_a = str(uuid4())
    user_b = str(uuid4())
    token_a = create_test_token(user_a)

    transport = ASGITransport(app=app)

    # 1. Manually setup the database state for the test
    conv_id = uuid4()
    conversation = Conversation(
        id=conv_id,
        participants=[user_a, user_b],
        participant_names={user_a: "Alice", user_b: "Bob"},
        last_msg="Hello Integration",
        last_sender_id=user_a,
    )
    await conversation.insert()

    # 2. Perform the HTTP Request
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        with patch("app.utils.jwt_handler.SECRET_KEY", "ci_test_secret"):
            ac.cookies.set("access_token", token_a)
            response = await ac.get("/inbox")

    # 3. Verify Response
    assert response.status_code == 200
    data = response.json()
    assert "conversations" in data
    assert len(data["conversations"]) == 1

    conv = data["conversations"][0]
    assert conv["recipient_name"] == "Bob"
    assert conv["last_message"] == "Hello Integration"


@pytest.mark.asyncio
async def test_conversation_history_permissions():
    """Verify User C cannot access a conversation between User A and User B."""
    user_a = str(uuid4())
    user_b = str(uuid4())
    user_c = str(uuid4())
    token_c = create_test_token(user_c)

    # 1. Create a conversation for A and B
    conv_id = uuid4()
    conversation = Conversation(
        id=conv_id,
        participants=[user_a, user_b],
        participant_names={user_a: "Alice", user_b: "Bob"},
        last_msg="Secret",
        last_sender_id=user_a,
    )
    await conversation.insert()

    # 2. Attempt access by User C
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        with patch("app.utils.jwt_handler.SECRET_KEY", "ci_test_secret"):
            ac.cookies.set("access_token", token_c)
            response = await ac.get(f"/conversations/{conv_id}/messages")

    # 3. Verify Access Denied
    assert response.status_code == 403
    assert response.json()["detail"] == "Access denied to this conversation"


@pytest.mark.asyncio
async def test_conversation_history(mock_rabbitmq):
    """Verify User A can fetch message history for a conversation."""
    user_a = str(uuid4())
    user_b = str(uuid4())
    token_a = create_test_token(user_a)
    conv_id = uuid4()

    # 1. Setup conversation and messages
    conversation = Conversation(
        id=conv_id,
        participants=[user_a, user_b],
        participant_names={user_a: "Alice", user_b: "Bob"},
        last_msg="Message 3",
        last_sender_id=user_a,
    )
    await conversation.insert()

    msg_texts = ["Message 1", "Message 2", "Message 3"]
    for text in msg_texts:
        await Message(conversation_id=conv_id, sender_id=user_a, recipient_id=user_b, body=text).insert()

    # 2. Fetch history via HTTP
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        with patch("app.utils.jwt_handler.SECRET_KEY", "ci_test_secret"):
            ac.cookies.set("access_token", token_a)
            response = await ac.get(f"/conversations/{conv_id}/messages")

    # 3. Verify
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 3
    assert [m["body"] for m in data] == msg_texts

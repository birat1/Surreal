from unittest.mock import patch
from uuid import uuid4

from app.main import app
from app.utils.jwt_handler import jwt
from fastapi.testclient import TestClient


def create_test_token(user_id: str) -> str:
    return jwt.encode({"sub": user_id}, "ci_test_secret", algorithm="HS256")

def test_inbox() -> None:
    """
    1. Connect via WS and send a message from User A to User B.
    2. Fetch Inbox for User A via HTTP
    3. Verify that the conversation appears in the inbox.
    """
    user_a = str(uuid4())
    user_b = str(uuid4())
    token_a = create_test_token(user_a)
    token_b = create_test_token(user_b)

    with patch("app.utils.jwt_handler.SECRET_KEY", "ci_test_secret"):
        with patch("app.routers.ws.fetch_names_from_auth_service") as mock_auth:
            mock_auth.return_value = {user_a: "Alice", user_b: "Bob"}

            with TestClient(app) as client:
                # Create a conversation
                client.cookies = {"access_token": token_a}
                with client.websocket_connect("/ws") as websocket:
                    payload = {
                        "recipient_id": user_b,
                        "body": "Hello Integration",
                    }
                    websocket.send_json(payload)
                    # Await message confirmation
                    websocket.receive_json()

                # User A fetches inbox via HTTP
                response = client.get("/inbox")
                assert response.status_code == 200
                data = response.json()

                # Verify
                assert "conversations" in data
                assert len(data["conversations"]) == 1
                conv = data["conversations"][0]

                assert conv["recipient_id"] == user_b
                assert conv["recipient_name"] == "Bob"
                assert conv["last_message"] == "Hello Integration"

def test_conversation_history_permissions() -> None:
    """Verify User C cannot access conversation between User A and User B."""
    user_a = str(uuid4())
    user_b = str(uuid4())
    user_c = str(uuid4())

    cid = f"{min(user_a, user_b)}_{max(user_a, user_b)}"
    token_c = create_test_token(user_c)

    with patch("app.utils.jwt_handler.SECRET_KEY", "ci_test_secret"):
        with TestClient(app) as client:
            client.cookies = {"access_token": token_c}
            response = client.get(f"/conversations/{cid}/messages")

            assert response.status_code == 403
            assert response.json()["detail"] == "Access denied to this conversation"

def test_conversation_history() -> None:
    """
    1. User A and User B have a conversation with messages.
    2. User A fetches the conversation history via HTTP.
    3. Verify the messages are returned correctly.
    """
    user_a = str(uuid4())
    user_b = str(uuid4())
    token_a = create_test_token(user_a)

    cid = f"{min(user_a, user_b)}-{max(user_a, user_b)}"

    with patch("app.utils.jwt_handler.SECRET_KEY", "ci_test_secret"):
        with patch("app.routers.ws.fetch_names_from_auth_service") as mock_auth:
            mock_auth.return_value = {user_a: "Alice", user_b: "Bob"}

            with TestClient(app) as client:
                # Setup conversation history
                client.cookies = {"access_token": token_a}
                with client.websocket_connect("/ws") as websocket:
                    messages = ["Hello Bob!", "How are you?", "Let's meet up."]
                    for msg in messages:
                        websocket.send_json({
                            "recipient_id": user_b,
                            "body": msg,
                        })
                        websocket.receive_json()  # Await confirmation

                response = client.get(f"/conversations/{cid}/messages")

                assert response.status_code == 200
                data = response.json()
                assert len(data) > 0
                assert [msg["body"] for msg in data] == messages
                assert all(msg["sender_id"] == user_a for msg in data)

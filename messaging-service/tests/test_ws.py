import os
from unittest.mock import patch
from uuid import uuid4

import pytest
from app.main import app
from app.utils.jwt_handler import jwt
from fastapi.testclient import TestClient


def create_test_token(user_id: str) -> str:
    return jwt.encode({"sub": user_id}, "ci_test_secret", algorithm="HS256")


def test_send_to_self_error() -> None:
    """A user should not be able to send a message to themselves."""
    user_id = str(uuid4())
    token = create_test_token(user_id)

    with patch("app.utils.jwt_handler.SECRET_KEY", "ci_test_secret"):
        with patch("app.routers.ws.fetch_names_from_auth_service") as mock_auth:
            mock_auth.return_value = {user_id: "Alice"}

            with TestClient(app) as client:
                client.cookies = {"access_token": token}

                with client.websocket_connect("/ws") as websocket:
                    websocket.send_json({
                        "recipient_id": user_id,
                        "body": "This should fail",
                    })

                    data = websocket.receive_json()

                    assert data["type"] == "error"
                    assert data["message"] == "Cannot send message to self"

def test_read_receipts() -> None:
    """
    1. User A sends a message to User B.
    2. User B connects via WS and reads the message.
    3. Verify that a read receipt is sent back to User A.
    """
    user_a = str(uuid4())
    user_b = str(uuid4())
    token_a = create_test_token(user_a)
    token_b = create_test_token(user_b)

    with patch("app.utils.jwt_handler.SECRET_KEY", "ci_test_secret"):
        with patch("app.routers.ws.fetch_names_from_auth_service") as mock_auth:
            mock_auth.return_value = {user_a: "Alice", user_b: "Bob"}

            with TestClient(app) as client:
                # Connect User A
                client.cookies = {"access_token": token_a}
                with client.websocket_connect("/ws") as websocket_a:
                    # Connect User B
                    client.cookies = {"access_token": token_b}
                    with client.websocket_connect("/ws") as websocket_b:
                        # User A sends a message to User B
                        websocket_a.send_json({
                            "recipient_id": user_b,
                            "body": "Hello, Bob!",
                        })

                        # Both users receive the message
                        websocket_a.receive_json()
                        websocket_b.receive_json()

                        # User B sends a read receipt back to User A
                        websocket_b.send_json({
                            "type": "read_receipt",
                            "sender_id": user_a,
                        })

                        # User A should receive the read receipt
                        notification = websocket_a.receive_json()

                        assert notification["type"] == "read_receipt"
                        assert notification["reader_id"] == user_b
                        assert "read_at" in notification

def test_websocket_messaging() -> None:
    """Test sending and receiving a message via WebSocket."""
    sender_id = str(uuid4())
    recipient_id = str(uuid4())
    token = create_test_token(sender_id)

    with patch("app.utils.jwt_handler.SECRET_KEY", "ci_test_secret"):
        with patch("app.routers.ws.fetch_names_from_auth_service") as mock_auth:
            mock_auth.return_value = {sender_id: "Alice", recipient_id: "Bob"}

            with TestClient(app) as client:
                client.cookies = {"access_token": token}

                with client.websocket_connect("/ws") as websocket:
                    payload = {
                        "recipient_id": recipient_id,
                        "body": "Hello Integration Test!",
                    }
                    websocket.send_json(payload)

                    data = websocket.receive_json()

                    assert data["body"] == "Hello Integration Test!"
                    assert data["sender_name"] == "Alice"
                    assert data["sender_id"] == sender_id
                    assert data["recipient_id"] == recipient_id
                    assert "created_at" in data

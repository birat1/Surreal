from typing import Annotated

from fastapi import APIRouter, Query, Request
from fastapi.responses import HTMLResponse, JSONResponse

from app.config import VALID_USERS
from app.db import conv_id, get_messages

router = APIRouter()

@router.get("/{username}/messages")
async def get_users_messages(username: str, request: Request, recipient: Annotated[str | None, Query()] = None):
    """
    Get messages for a user. If recipient is provided, get conversation between username and recipient
    e.g. ?recipient=user2
    """
    if username not in VALID_USERS:
        return HTMLResponse("Unknown user", status_code=404)

    messages = get_messages()

    # If recipient is provided, get conversation messages
    if recipient:
        if recipient not in VALID_USERS:
            return HTMLResponse("User does not exist", status_code=404)
        if recipient == username:
            return HTMLResponse("Cannot have conversation with self", status_code=400)
        cid = conv_id(username, recipient)
        conv_msgs = messages.get(cid, [])
        annotated = [{**m, "side": ("left" if m["sender"] == username else "right")} for m in conv_msgs]

        if "text/html" in request.headers.get("accept", ""):
            html = """
            <style>
                .msg { padding: 8px; margin: 6px 0; max-width: 70%; border-radius: 6px; }
                .left {text-align: left; margin-right: auto; }
                .right {text-align: right; margin-left: auto; }
            </style>
            <h1>Messages</h1>
            """
            for m in annotated:
                cls = "left" if m["side"] == "left" else "right"
                html += f"<div class='msg {cls}'><b>{m['sender']}:</b> {m['body']} <small>({m['created_at']})</small></div>"
            return HTMLResponse(html)
        return JSONResponse(annotated)

    # Get list of recipients the user has conversations with
    recipients: list[str] = []
    for cid, conv in messages.items():
        _, a, b = cid.split("-", 2)
        if a == username and conv:
            recipients.append(b)
        elif b == username and conv:
            recipients.append(a)

    # Newest message first based on timestamp
    recipients = list(dict.fromkeys(reversed(recipients)))
    return JSONResponse({"user": username, "recipients": recipients})

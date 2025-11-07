import datetime
from typing import Dict, List, Set
from uuid import uuid4
from fastapi import FastAPI, HTTPException, Query, Request, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse, JSONResponse

app = FastAPI()

# CORS settings
origins = [
    "http://localhost:5173",  # frontend URL,
    "http://127.0.0.1:5173"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

# testing users
VALID_USERS: Set[str] = {"user1", "user2", "user3"}

# Generate a consistent conversation ID for two users
def conv_id(user_a: str, user_b: str) -> str:
    if user_a == user_b:
        raise ValueError("Cannot create conversation with self")
    a, b = sorted([user_a, user_b])
    return f"conv-{a}-{b}"

# In-memory message store: conversation_id -> list of messages
messages: Dict[str, List[Dict]] = {}

@app.get("/")
def health():
    return {"blank page": "This is a blank page"}


@app.get("/{username}/messages")
async def get_messages(username: str, request: Request, recipient: str | None = Query(None)):
    """
    Get messages for a user. If recipient is provided, get conversation between username and recipient.
    e.g. ?recipient=user2
    """
    if username not in VALID_USERS:
        return HTMLResponse("Unknown user", status_code=404)

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
                cls = "left" if m['side'] == "left" else "right"
                html += f"<div class='msg {cls}'><b>{m['sender']}:</b> {m['body']} <small>({m['created_at']})</small></div>"
            return HTMLResponse(html)
        return JSONResponse(annotated)

    # Get list of recipients the user has conversations with
    recipients: List[str] = []
    for cid, conv in messages.items():
        _, a, b = cid.split("-", 2)
        if a == username and conv:
            recipients.append(b)
        elif b == username and conv:
            recipients.append(a)

    # Newest message first based on timestamp
    recipients = list(dict.fromkeys(reversed(recipients)))
    return JSONResponse({"user": username, "recipients": recipients})

# WebSocket connection manager
class ConnectionManager:
    def __init__(self):
        self.active: Dict[str, List[WebSocket]] = {}

    async def connect(self, username: str, websocket: WebSocket):
        if username not in VALID_USERS:
            raise HTTPException(status_code=404, detail="unknown user")
        await websocket.accept()
        self.active.setdefault(username, []).append(websocket)

    def disconnect(self, username: str, websocket: WebSocket):
        conns = self.active.get(username)
        if conns and websocket in conns:
            conns.remove(websocket)
        if conns == []:
            self.active.pop(username, None)

    # Send a payload to all active connections of a user
    async def send_to_user(self, username: str, payload: Dict):
        for ws in list(self.active.get(username, [])):
            try:
                await ws.send_json(payload)
            except Exception:
                try:
                    ws.close()
                except Exception:
                    pass
                self.disconnect(username, ws)

manager = ConnectionManager()

#
@app.websocket("/ws/{username}")
async def websocket_endpoint(websocket: WebSocket, username: str):
    if username not in VALID_USERS:
        await websocket.close(code=1008)
        return

    await manager.connect(username, websocket)
    try:
        while True:
            data = await websocket.receive_json()
            body = (data.get("body") or "").strip()
            recipient = (data.get("recipient") or "").strip()

            if not body:
                continue
            if recipient not in VALID_USERS:
                await manager.send_to_user(username, {"type": "error", "message": "Unknown recipient"})
                continue
            if recipient == username:
                await manager.send_to_user(username, {"type": "error", "message": "Cannot send message to self"})
                continue
            
            # Store the message
            cid = conv_id(username, recipient)
            now = datetime.datetime.now(datetime.timezone.utc).isoformat() + "Z"
            msg = {
                "type": "message",
                "id": str(uuid4()),
                "conversation_id": cid,
                "sender": username,
                "recipient": recipient,
                "body": body,
                "created_at": now
            }
            messages.setdefault(cid, []).append(msg)

            # Only between sender and recipient (left=sender, right=recipient)
            await manager.send_to_user(username, {**msg, "side": "left"})
            await manager.send_to_user(recipient, {**msg, "side": "right"})

    except WebSocketDisconnect:
        manager.disconnect(username, websocket)
    except Exception:
        try:
            await websocket.close()
        except Exception:
            pass
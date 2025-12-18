from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import ALLOWED_ORIGINS
from app.db import init_db
from app.routers import messages, ws
from app.utils.rabbitmq_publisher import publisher


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    await publisher.start()
    try:
        yield
    finally:
        await publisher.stop()

app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def health():
    return {"blank page": "This is a blank page"}

app.include_router(messages.router)
app.include_router(ws.router)

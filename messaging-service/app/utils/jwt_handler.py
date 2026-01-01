import logging
import os
from uuid import UUID

from fastapi import HTTPException, Request
from jose import JWTError, jwt

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


SECRET_KEY = os.getenv("JWT_SECRET")
ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")


def get_current_user(request: Request) -> str:
    """Handle JWT validation and returns UserID as string."""
    token = request.cookies.get("access_token")

    if not token:
        logger.debug("No token found in cookies")
        raise HTTPException(status_code=401, detail="Not authenticated")

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")

        if user_id is None:
            logger.debug("Token payload missing 'sub'")
            raise HTTPException(status_code=401, detail="Invalid token payload")

        return user_id
    except JWTError as e:
        logger.debug(f"JWTError occurred - {e}")
        logger.debug(f"Token value - {token[:10]}...")
        raise HTTPException(status_code=401, detail="Could not validate credentials") from e


async def get_ws_user_id(token: str | None) -> UUID | None:
    """Validate JWT for WebSocket and returns UserID."""
    if not token:
        return None

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")

        if user_id is None:
            return None

        return UUID(user_id)
    except (JWTError, ValueError) as e:
        logger.debug(f"WS Token Error: {e}")
        return None

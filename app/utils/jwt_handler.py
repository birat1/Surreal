import os
from uuid import UUID

from fastapi import Depends, HTTPException, Query
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt

SECRET_KEY = os.getenv("JWT_SECRET")
ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

def get_current_user(token: str = Depends(oauth2_scheme)) -> str:
    """Validates JWT and returns UserID as string"""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")

        if user_id is None:
            print("DEBUG: Token payload missing 'sub'")
            raise HTTPException(status_code=401, detail="Invalid token payload")

        return user_id
    except JWTError as e:
        print(f"DEBUG: JWTError occurred - {e}")
        print(f"DEBUG: Token value - {token[:10]}...")
        raise HTTPException(status_code=401, detail="Could not validate credentials") from e

async def get_ws_user_id(token: str = Query(...)) -> UUID | None:
    """Validates JWT for WebSocket and returns UserID"""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")

        if user_id is None:
            return None

        return UUID(user_id)
    except (JWTError, ValueError) as e:
        print(f"DEBUG: WS Token Error: {e}")
        return None

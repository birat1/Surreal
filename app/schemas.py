from uuid import UUID
from pydantic import BaseModel, EmailStr

class EmailRequest(BaseModel):
    email: EmailStr


class VerifyCodeRequest(BaseModel):
    email: EmailStr
    password: str
    code: str


class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class UserProfileRequest(BaseModel):
    full_name: str
    username: str
    age: int
    bio: str
    course: str
    accommodation: str
    university_year: str
    languages: list[str]
    ethnicities: list[str]
    home_area: str
    fun_fact: str
    societies: list[str]
    sports: list[str]
    gym_goer: str


class UserProfileResponse(BaseModel):
    id: int
    user_id: UUID
    full_name: str
    age: int | None = None
    username: str
    bio: str
    course: str | None = None
    accommodation: str | None = None
    university_year: str | None = None
    languages: list[str] | None = None
    ethnicities: list[str] | None = None
    home_area: str | None = None
    fun_fact: str | None = None
    societies: list[str] | None = None
    sports: list[str] | None = None
    gym_goer: str | None = None

    class Config:
        from_attributes = True

class BatchIDRequest(BaseModel):
    user_ids: list[str]

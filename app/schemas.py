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

    show_age: bool = True
    show_bio: bool = True
    show_accommodation: bool = True
    show_languages: bool = True
    show_ethnicities: bool = True
    show_home_area: bool = True
    show_societies: bool = True
    show_sports: bool = True
    show_gym_goer: bool = True

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

    show_age: bool
    show_bio: bool
    show_accommodation: bool
    show_languages: bool
    show_ethnicities: bool
    show_home_area: bool
    show_societies: bool
    show_sports: bool
    show_gym_goer: bool

    class Config:
        from_attributes = True

class BatchIDRequest(BaseModel):
    user_ids: list[str]

# REMOVE IF NOT USED
class MatchedUsersResponse(BaseModel):
    logged_in_user_id: UUID # ID of currently logged in user
    other_user_id: UUID # ID of the matched user

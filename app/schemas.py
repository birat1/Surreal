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
    nickname: str
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
    user_id: int
    full_name: str
    age: int | None = None
    nickname: str | None = None
    bio: str | None = None
    course: str | None = None
    accommodation: str | None = None
    university_year: str | None = None
    languages: list[str] | None = None
    ethnicities: list[str] | None = None
    home_area: str | None = None
    fun_fact: str | None = None
    societies: list[str] | None = None
    sports: list[str] | None = None
    gym_goer: bool | None = None

    class Config:
        orm_mode = True


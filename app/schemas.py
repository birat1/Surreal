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
    age: int
    nickname: str
    bio: str
    course: str
    accomodation: str
    university_year: int
    languages: str
    ethnicity: str
    home_area: str

class UserProfileResponse(BaseModel):
    id: int
    user_id: int
    full_name: str
    age: int | None = None
    nickname: str | None = None
    bio: str | None = None
    course: str | None = None
    accomodation: str | None = None
    university_year: int | None = None
    languages: str | None = None
    ethnicity: str | None = None
    home_area: str | None = None

    class Config:
        orm_mode = True

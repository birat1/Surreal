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

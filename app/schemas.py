from pydantic import BaseModel, EmailStr
from typing import List

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
    languages: List[str]
    ethnicities: List[str]
    home_area: str
    fun_fact: str
    societies: List[str]
    sports: List[str]
    gym_goer: str
    

class UserProfileResponse(BaseModel):
    id: int
    user_id: int
    full_name: str
    age: int | None = None
    nickname: str | None = None
    bio: str
    course: str | None = None
    accommodation: str | None = None     
    university_year: str | None = None    
    languages: List[str] | None = None   
    ethnicities: List[str] | None = None 
    home_area: str | None = None
    fun_fact: str | None = None          
    societies: List[str] | None = None    
    sports: List[str] | None = None       
    gym_goer: bool | None = None          

    class Config:
        from_attributes = True
    
  

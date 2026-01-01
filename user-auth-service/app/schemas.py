from uuid import UUID

from pydantic import BaseModel, EmailStr


class EmailRequest(BaseModel):
    """Email request schema."""

    email: EmailStr


class VerifyCodeRequest(BaseModel):
    """Verify code request schema."""

    email: EmailStr
    password: str
    code: str


class LoginRequest(BaseModel):
    """Login request schema."""

    email: EmailStr
    password: str


class UserProfileRequest(BaseModel):
    """User profile request schema."""

    full_name: str
    username: str
    is_admin: bool
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
    """User profile response schema."""

    id: int
    user_id: UUID
    full_name: str
    is_admin: bool
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
    profile_picture: str | None = None

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
        """Configuration for the Pydantic model."""

        from_attributes = True


class BatchIDRequest(BaseModel):
    """Batch ID request schema."""

    user_ids: list[str]


class MatchedUsersResponse(BaseModel):
    """Matched users response schema."""

    logged_in_user_id: UUID  # ID of currently logged in user
    other_user_id: UUID  # ID of the matched user

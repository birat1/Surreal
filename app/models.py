import uuid
from datetime import datetime, timedelta, timezone

from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String
from sqlalchemy.dialects.postgresql import ARRAY, UUID

from app.database import Base


# This maps the Python User class to the users table in Postgres.
class User(Base):

    __tablename__ = "users" # name of the table in postgres

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    email_address = Column(String, unique=True, nullable=False)
    password = Column(String, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))


class EmailVerificationCode(Base):      # The temporary verification code is stored in this table

    __tablename__ = "email_verifications"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, nullable=False)
    code = Column(String, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    expires_at = Column(DateTime, default=lambda: datetime.now(timezone.utc) + timedelta(minutes=10))
    verified = Column(Boolean, default=False)


class UserProfile(Base):

    __tablename__ = "user_profiles"

    # Profile Fields
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), unique=True)  # this links to the respective user
    full_name = Column(String, nullable=False)
    username = Column(String, nullable=False)
    age = Column(Integer, nullable=True)
    bio = Column(String, nullable=True)
    course = Column(String, nullable=True)
    accommodation = Column(String, nullable=True)
    university_year = Column(String, nullable=True)
    languages = Column(ARRAY(String), nullable=True)
    ethnicities = Column(ARRAY(String), nullable=True)
    home_area = Column(String, nullable=True)
    fun_fact = Column(String, nullable=False)
    societies = Column(ARRAY(String), nullable=True)
    sports = Column(ARRAY(String), nullable=True)
    gym_goer = Column(String, nullable=True)

    # Visibility toggles
    show_username = Column(Boolean, default=True)
    show_age = Column(Boolean, default=True)
    show_bio = Column(Boolean, default=True)
    show_course = Column(Boolean, default=True)
    show_accommodation = Column(Boolean, default=True)
    show_university_year = Column(Boolean, default=True)
    show_languages = Column(Boolean, default=True)
    show_ethnicities = Column(Boolean, default=True)
    show_home_area = Column(Boolean, default=True)
    show_fun_fact = Column(Boolean, default=True)
    show_societies = Column(Boolean, default=True)
    show_sports = Column(Boolean, default=True)
    show_gym_goer = Column(Boolean, default=True)


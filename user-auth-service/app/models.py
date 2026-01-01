import uuid
from datetime import datetime, timedelta, timezone

from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String, UniqueConstraint
from sqlalchemy.dialects.postgresql import ARRAY, UUID
from sqlalchemy.orm import relationship

from app.database import Base


# This maps the Python User class to the users table in Postgres.
class User(Base):
    """User model representing a user in the system."""

    __tablename__ = "users"  # name of the table in postgres

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    email_address = Column(String, unique=True, nullable=False)
    password = Column(String, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    user_profile = relationship("UserProfile", back_populates="user", uselist=False)

    matches_as_user1 = relationship("MatchedUsers", foreign_keys="MatchedUsers.user1_id", back_populates="user1")
    matches_as_user2 = relationship("MatchedUsers", foreign_keys="MatchedUsers.user2_id", back_populates="user2")


class EmailVerificationCode(Base):
    """Verification code model for email verification."""

    __tablename__ = "email_verifications"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, nullable=False)
    code = Column(String, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    expires_at = Column(DateTime, default=lambda: datetime.now(timezone.utc) + timedelta(minutes=10))
    verified = Column(Boolean, default=False)


class UserProfile(Base):
    """User profile model representing additional user information."""

    __tablename__ = "user_profiles"

    # Profile Fields
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), unique=True)  # this links to the respective user
    full_name = Column(String, nullable=False)
    is_admin = Column(Boolean, default=False)
    username = Column(String, unique=True, nullable=False)
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
    profile_picture = Column(String, nullable=True)

    # optional fields
    show_age = Column(Boolean, default=True)
    show_bio = Column(Boolean, default=True)
    show_accommodation = Column(Boolean, default=True)
    show_languages = Column(Boolean, default=True)
    show_ethnicities = Column(Boolean, default=True)
    show_home_area = Column(Boolean, default=True)
    show_societies = Column(Boolean, default=True)
    show_sports = Column(Boolean, default=True)
    show_gym_goer = Column(Boolean, default=True)

    user = relationship("User", back_populates="user_profile")


class MatchedUsers(Base):
    """Model representing matched users and their compatibility score."""

    __tablename__ = "matched_users"

    id = Column(Integer, primary_key=True, index=True)
    user1_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    user2_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    score = Column(Integer, nullable=False)

    user1 = relationship("User", foreign_keys=[user1_id], back_populates="matches_as_user1")
    user2 = relationship("User", foreign_keys=[user2_id], back_populates="matches_as_user2")

    # Ensures that a pair of matched users only appears once
    __table_args__ = (UniqueConstraint("user1_id", "user2_id", name="unique_user_pair"),)

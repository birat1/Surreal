from sqlalchemy import Column, Integer, String, DateTime, Boolean
from datetime import datetime, timedelta
from app.database import Base


# This maps the Python User class to the users table in Postgres.
class User(Base):
    __tablename__ = "users" # name of the table in postgres

    id = Column(Integer, primary_key=True, index=True)
    email_address = Column(String, unique=True, nullable=False)
    password = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow())


    # full_name = Column(String, nullable=False)
    # age = Column(Integer, nullable=False)
    # email_address = Column(String, nullable=False)
    # nickname = Column(String, nullable=True)
    # bio = Column(String, nullable=True)
    # course = Column(String, nullable=True)
    # accomodation = Column(String, nullable=True)
    # university_year = Column(Integer, nullable=True)
    # languages = Column(String, nullable=True)
    # ethnicity = Column(String, nullable=True)
    # home_area = Column(String, nullable=True)


class EmailVerificationCode(Base):      # The temporary verification code is stored in this table   
    __tablename__ = "email_verifications"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, nullable=False)
    code = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    expires_at = Column(DateTime, default=lambda: datetime.utcnow() + timedelta(minutes=10))
    verified = Column(Boolean, default=False)
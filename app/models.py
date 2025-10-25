from sqlalchemy import Column, Integer, String
from app.database import Base


# This maps the Python User class to the users table in Postgres.
class User(Base):
    __tablename__ = "users" # name of the table in postgres

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String, nullable=False)
    age = Column(Integer, nullable=False)
    nickname = Column(String, nullable=True)
    bio = Column(String, nullable=True)
    course = Column(String, nullable=True)
    accomodation = Column(String, nullable=True)
    university_year = Column(Integer, nullable=True)
    languages = Column(String, nullable=True)
    ethnicity = Column(String, nullable=True)
    home_area = Column(String, nullable=True)
    
import os
import sys
from passlib.context import CryptContext
import json
from datetime import datetime

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(CURRENT_DIR)
sys.path.append(PROJECT_ROOT)

from app.database import SessionLocal
from app.models import User, UserProfile

pwd_context = CryptContext(schemes=["argon2"])

def seed():
    db = SessionLocal()

    JSON_PATH = os.path.join(CURRENT_DIR, "seed_data.json")
    with open(JSON_PATH, "r", encoding="utf-8") as f:
        data = json.load(f)

        print("Clearing existing data...")
        db.query(UserProfile).delete()
        db.query(User).delete()
        db.commit()

        for u in data["users"]:
            hashed_password = pwd_context.hash(u["password"])
            user = User(
                email_address=u["email"],
                password=hashed_password,
                created_at=datetime.now()
            )
            db.add(user)
            db.commit()
            db.refresh(user)

            user_p = u.get("profile")
            if user_p:
                profile = UserProfile(
                    user_id=user.id,
                    full_name=user_p.get("full_name"),
                    age=user_p.get("age"),
                    nickname=user_p.get("nickname"),
                    bio=user_p.get("bio"),
                    course=user_p.get("course"),
                    accomodation=user_p.get("accommodation"),
                    university_year=user_p.get("university_year"),
                    languages=user_p.get("languages"),
                    ethnicity=user_p.get("ethnicity"),
                    home_area=user_p.get("home_area")
                )
                db.add(profile)
                db.commit()

    db.close()
    print("Seeding Complete!")


if __name__ == "__main__":
    seed()

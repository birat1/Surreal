import json
import logging
import os
import sys
from datetime import datetime, timezone
from pathlib import Path

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(CURRENT_DIR)
sys.path.append(PROJECT_ROOT)

from app.database import SessionLocal  # noqa: E402
from app.models import MatchedUsers, User, UserProfile  # noqa: E402
from app.scores import list_attrs_points, single_attrs_points  # noqa: E402
from passlib.context import CryptContext  # noqa: E402

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

pwd_context = CryptContext(schemes=["argon2"])


def seed() -> None:
    """Seed the database with initial user and profile data, and generate matches."""
    db = SessionLocal()

    json_path = Path(CURRENT_DIR) / "seed_data.json"
    with open(json_path, encoding="utf-8") as f:
        data = json.load(f)

        logger.info("Clearing existing data...")
        db.query(MatchedUsers).delete()
        db.query(UserProfile).delete()
        db.query(User).delete()
        db.commit()

        logger.info("Seeding Users and Profiles...")
        for u in data:
            hashed_password = pwd_context.hash(u["password"])
            user = User(
                email_address=u["email"],
                password=hashed_password,
                created_at=datetime.now(timezone.utc),
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
                    username=user_p.get("username"),
                    bio=user_p.get("bio"),
                    fun_fact=user_p.get("fun_fact"),
                    course=user_p.get("course"),
                    accommodation=user_p.get("accommodation"),
                    university_year=user_p.get("university_year"),
                    languages=user_p.get("languages"),
                    ethnicities=user_p.get("ethnicity"),
                    home_area=user_p.get("home_area"),
                    societies=user_p.get("society"),
                    sports=user_p.get("sport"),
                    gym_goer=user_p.get("gym_goer"),
                    profile_picture=user_p.get("profile_picture"),
                )
                db.add(profile)
                db.commit()

    all_profiles = db.query(UserProfile).all()

    new_matches = []

    for i, p1 in enumerate(all_profiles):
        for p2 in all_profiles[i + 1 :]:
            score = 0

            # Single attribute scoring
            for attr, points in single_attrs_points.items():
                if getattr(p1, attr) == getattr(p2, attr):
                    score += points

            # List attribute scoring
            for attr, points in list_attrs_points.items():
                val1 = set(getattr(p1, attr) or [])
                val2 = set(getattr(p2, attr) or [])

                common = val1 & val2
                score += len(common) * points

            if score > 0:
                new_matches.append(MatchedUsers(user1_id=p1.user_id, user2_id=p2.user_id, score=score))

    if new_matches:
        db.add_all(new_matches)
        db.commit()
    else:
        logger.info("No matches found among seeded users.")

    db.close()
    logger.info("Seeding Complete!")


if __name__ == "__main__":
    seed()

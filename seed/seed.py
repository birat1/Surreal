import json
import logging
import sys
from datetime import datetime, timezone
from pathlib import Path

from app.database import SessionLocal
from app.models import MatchedUsers, User, UserProfile
from passlib.context import CryptContext

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

CURRENT_DIR = Path(Path(__file__).resolve()).parent
PROJECT_ROOT = Path(CURRENT_DIR).parent
sys.path.append(PROJECT_ROOT)

pwd_context = CryptContext(schemes=["argon2"])

def seed():
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
        for u in data["users"]:
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
                )
                db.add(profile)
                db.commit()

    all_profiles = db.query(UserProfile).all()

    single_attrs = ["age", "course", "accommodation", "university_year", "gym_goer"]
    list_attrs = ["languages", "ethnicities", "societies", "sports"]

    new_matches = []

    for i, p1 in enumerate(all_profiles):
        for p2 in all_profiles[i + 1 :]:
            match_found = False

            for attr in single_attrs:
                if getattr(p1, attr) == getattr(p2, attr):
                    match_found = True
                    break

            if not match_found:
                for attr in list_attrs:
                    val1 = getattr(p1, attr) or []
                    val2 = getattr(p2, attr) or []

                    if set(val1) & set(val2):
                        match_found = True
                        break

            if match_found:
                new_matches.append(MatchedUsers(user1_id=p1.user_id, user2_id=p2.user_id))

    if new_matches:
        db.add_all(new_matches)
        db.commit()
        logger.info(f"Seeded {len(new_matches)} matched user pairs.")  # noqa: G004
    else:
        logger.info("No matches found among seeded users.")

    db.close()
    logger.info("Seeding Complete!")


if __name__ == "__main__":
    seed()

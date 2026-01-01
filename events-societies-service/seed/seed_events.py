import logging
import os
import sys

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(CURRENT_DIR)
sys.path.append(PROJECT_ROOT)

from app.database import SessionLocal
from app.models import EventRSVP, Events


def seed_database() -> None:
    """Seeds the database with sample events data."""
    db = SessionLocal()
    try:
        # 1. Clear existing data
        logger.info("Clearing existing data...")
        db.query(EventRSVP).delete()
        db.query(Events).delete()
        db.commit()

        sample_events = [
            Events(
                name_of_event="Asian Night",
                event_date="2026-05-15",
                event_time="22:00",
                event_location="Rubix",
                event_organiser="ABACUS",
            ),
            Events(
                name_of_event="Y2K Night",
                event_date="2026-05-22",
                event_time="22:00",
                event_location="Rubix",
                event_organiser="USSU",
            ),
            Events(
                name_of_event="FilSoc Potluck",
                event_date="2026-07-10",
                event_time="19:00",
                event_location="LTD",
                event_organiser="Surrey Filipino Society",
            ),
            Events(
                name_of_event="Citrus",
                event_date="2026-03-15",
                event_time="22:00",
                event_location="Rubix",
                event_organiser="USSU",
            ),
            Events(
                name_of_event="Matsuri",
                event_date="2026-02-10",
                event_time="17:00",
                event_location="12TB002",
                event_organiser="Japanese Society",
            ),
            Events(
                name_of_event="KPOP Showcase",
                event_date="2026-04-05",
                event_time="13:00",
                event_location="Univeristy Hall",
                event_organiser="KISS",
            ),
            Events(
                name_of_event="Sushi Making Class",
                event_date="2026-02-24",
                event_time="16:00",
                event_location="The Basement",
                event_organiser="USSU",
            ),
            Events(
                name_of_event="Women In STEM Talk",
                event_date="2026-05-10",
                event_time="16:00",
                event_location="LTG",
                event_organiser="CompSci Soc",
            ),
            Events(
                name_of_event="Games Night",
                event_date="2026-03-24",
                event_time="19:00",
                event_location="LTD",
                event_organiser="Tamil Society",
            ),
            Events(
                name_of_event="Dance Taster Session",
                event_date="2026-06-01",
                event_time="14:30",
                event_location="SSP",
                event_organiser="Salsa and Bachata Society",
            ),
        ]

        # 3. Add and commit to database
        db.add_all(sample_events)
        db.commit()

        count = db.query(Events).count()
        logger.info(f"Events in DB after seeding: {count}")

        logger.info(f"Successfully cleared and re-seeded {len(sample_events)} events!")
    except Exception as e:
        logger.exception(f"An error occurred during seeding: {e}")
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    seed_database()

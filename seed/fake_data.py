from faker import Faker
import json
import random

fake = Faker()

courses = [
    "Computer Science", "Chemistry", "Mathematics",
    "Physics", "Psychology", "Economics", "Law", "Politics", 
    "History"
]

accommodations = [
    "Manor Park", "Stag Hill", "Commuting", "Private Housing"
]

years = [
    "First Year", "Second Year", "Third Year", 
    "Foundation Year", "Placement Year"
]

ethnicity_language_map = {
    "British": ["English"],
    "Indian": ["Hindi", "Bengali", "Tamil", "English"],
    "Pakistani": ["Urdu", "Punjabi", "English"],
    "Chinese": ["Mandarin", "Cantonese"],
    "Arab": ["Arabic", "English"],
    "Portuguese": ["Portuguese", "Spanish"],
    "Spanish": ["Spanish", "Portuguese"],
    "Nepali": ["Nepali", "Hindi"],
    "Japanese": ["Japanese"],
    "Korean": ["Korean"],
    "Russian": ["Russian"],
    "German": ["German", "English"],
    "French": ["French", "English"],
    "Albanian": ["Albanian", "English"],
}


home_areas = [
    "London", "Manchester", "Birmingham", "Winchester", 
    "Leeds", "Southampton", "Kent"
]

societies = [ 
    "ABACUS", "Baking Society", "Caribbean Students' Society", 
    "Debating Society", "EARS", "Filipino Society", "GameSoc", 
    "Hindu Society", "Islamic Society", "Japanese Society", 
    "Kannada Society", "Languages Society", "MaDSoc", 
    "Nepalese Society", "Opa Surrey", "ParaSoc", "Rifle Club",
    "Salsa Society", "Tamil Society", "UAS Team Peryton", 
    "Vet Band", "Welsh Society", "Zoological Society",
]

sports = [ 
    "Football", "Horse Riding", "Basketball", "Netball", "Swimming",
    "Water Polo", "Tennis", "Badminton", "Volleyball", "MMA",
    "Boxing", "Cricket", "Rugby", "Hockey", "Athletics",
    "Lacrosse", "Sailing", "Rock Climbing", "Taekwondo",
]

bio_templates = [
    "Hi! I'm {name}, currently studying {course}. Always up for a chat!",
    "I love meeting new people and exploring campus. Studying {course}.",
    "You'll usually find me at the library or grabbing coffee on Stag Hill!",
    "Always looking for study buddies! I'm doing {course}.",
    "New to Surrey and excited to make friends :)",
    "Love gaming, movies, and late-night discussions. Doing {course}.",
    "Balancing uni life and hobbies one day at a time!",
]

funfact_templates = [
    "I once accidentally photobombed a celebrity on a holiday.",
    "I can solve a simple Rubik's Cube in under two minutes.",
    "I'm a massive Formula 1 fan, even though I don't have a driver's license.",
    "I drink more coffee than any human should, mainly just for the warmth.",
    "I've rewatched The Office at least 9 times.",
    "I have a pet cat who thinks they are a dog.",
    "I played the Triangle in my school band.",
]

data = []

for _ in range(25):
    full_name = fake.name()
    parts = full_name.split()

    first, last = parts[0], parts[-1]

    username = first.lower()
    email = f"{first.lower()}{last.lower()}@surrey.ac.uk"

    ethnicity = random.choice(list(ethnicity_language_map.keys()))
    possible_langs = ethnicity_language_map[ethnicity]
    language = random.choice(possible_langs)

    course = random.choice(courses)

    bio = random.choice(bio_templates).format(name=first.capitalize(), course=course)

    fun_fact = random.choice(funfact_templates)

    user = {
        "email": email,
        "password": "password",
        "profile": {
            "full_name": full_name,
            "age": random.randint(18, 23),
            "username": username,
            "bio": bio,
            "fun_fact": fun_fact,
            "course": course,
            "accommodation": random.choice(accommodations),
            "university_year": random.choice(years),
            "languages": language,
            "ethnicity": ethnicity,
            "home_area": random.choice(home_areas),
            "society": random.choice(societies),
            "sport": random.choice(sports),
            "gym_goer": random.choice(["Yes", "No"])
        }
    }

    data.append(user)


with open("seed_data.json", "w") as f:
    json.dump(data, f, indent=4)

print("Fake data written to seed_data.json")

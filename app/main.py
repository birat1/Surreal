from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, SessionLocal
from app import models
from typing import Annotated
from sqlalchemy.orm import Session
from pydantic import BaseModel


app = FastAPI()

# CORS settings
origins = [
    "http://localhost:5173",  # frontend URL,
    "http://127.0.0.1:5173"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

db_dependency = Annotated[Session, Depends(get_db)]


# This will create all tables defined in models.py if they don't exist, it does this as soon as the backend server is started
models.Base.metadata.create_all(bind=engine)

@app.get("/")
def health():
    return {"status": "ok"}


class SignUpRequest(BaseModel):
    full_name: str
    age: int
    nickname: str
    bio: str
    course: str
    accomodation: str
    university_year: int
    languages: str
    ethnicity: str
    home_area: str


# this function receives the values from the user signup form and inserts it into the postgres database
@app.post("/signup")
def signup_user(request: SignUpRequest, db: Session = Depends(get_db)):

    print("Received request: ", request.dict())

    try:
        new_user = models.User(
            full_name = request.full_name,
            age = request.age,
            nickname=request.nickname,
            bio=request.bio,
            course=request.course,
            accomodation=request.accomodation,
            university_year=request.university_year,
            languages=request.languages,
            ethnicity=request.ethnicity,
            home_area=request.home_area
        )
        
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        
        return {"message": "User created successfully,", "user's name": new_user.full_name}
    
    except Exception as e:
        print("Error inserting user", e)

        raise HTTPException(status_code=400, detail=str(e))


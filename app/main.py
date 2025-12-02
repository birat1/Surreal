import os

from fastapi import FastAPI, Depends, HTTPException, status, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi_mail import FastMail, MessageSchema, ConnectionConfig, MessageType

from app.database import engine, SessionLocal
from app.utils.jwt_handler import create_jwt_token, verify_jwt_token
from app.schemas import EmailRequest, VerifyCodeRequest, LoginRequest, UserProfileRequest, UserProfileResponse
from app.models import User

from app import models

from typing import Annotated, List
from sqlalchemy.orm import Session

from starlette.responses import JSONResponse
import random

from datetime import datetime, timedelta
from passlib.context import CryptContext


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


# Email Credentials
sender_email = os.getenv("EMAIL")
sender_pass = os.getenv("PASS")
app_password = os.getenv("APP_PASSWORD")


conf = ConnectionConfig(
    MAIL_USERNAME= sender_email,
    MAIL_PASSWORD=app_password.replace(" ",""),
    MAIL_FROM=sender_email,
    MAIL_PORT=587,
    MAIL_SERVER="smtp.gmail.com",
    MAIL_FROM_NAME="Surreal",  # This is what the user sees as sender
    MAIL_STARTTLS=True,            
    MAIL_SSL_TLS=False,
    USE_CREDENTIALS=True,
    VALIDATE_CERTS=True
)


@app.get("/")
def health():
    return {"status": "ok"}


# This method sends 6 digit verification code to ensure user is a surrey student
@app.post("/send-verification-code")
async def send_verification_code(request: EmailRequest, db: Session = Depends(get_db)):
    verification_code = str(random.randint(100000, 999999)) # Creates a random 6 digit number

    # check to see if there is already an existing user with this email (in which case they cannot sign up again)
    existing_user = db.query(models.User).filter(models.User.email_address == request.email).first()
    if existing_user:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="User with this email already exists")

    existing_record = db.query(models.EmailVerificationCode).filter_by(email= request.email).first()

    if existing_record:
        existing_record.code = verification_code
        existing_record.created_at = datetime.utcnow()
        existing_record.expires_at = datetime.utcnow() + timedelta(minutes=10)
        existing_record.verified = False
    else:
        new_record = models.EmailVerificationCode(
            email=request.email,
            code=verification_code
        )
        db.add(new_record)

    db.commit()


    html = f"<p>Hi! Thank you for signing up to Surreal. Your verification code is: {verification_code}</p>"

    message = MessageSchema(
        subject="Your Surreal Verification Code",
        recipients=[request.email],
        body=html,
        subtype=MessageType.html
    )

    fm = FastMail(conf)
    await fm.send_message(message)
    return JSONResponse(status_code=200, content= {"message": "email has been sent"})


# hash password before storing in db for security
pwd_context = CryptContext(schemes=["argon2"])

# This method checks if the 6 digit code they entered is correct (compares the value in the database for their email)
@app.post("/verify-code")
def verify_code(request: VerifyCodeRequest, db: Session = Depends(get_db)):
    record = db.query(models.EmailVerificationCode).filter(models.EmailVerificationCode.email == request.email).first() # get the record with email from previous step 

    if not record:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No verification record found for this email")
    
    # check if email is already verified
    if record.verified:
        return {"message": "Email already verified"}
    
    # check if the code they entered is actually correct
    if record.code != request.code:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid verification code")
    
    hashed_password = pwd_context.hash(request.password)


    new_user = models.User(
        email_address = request.email,
        password = hashed_password,
        created_at = datetime.utcnow()
    )

    db.add(new_user)
    record.verified = True
    db.commit()
    db.refresh(record)

    jwt_token = create_jwt_token(data={"sub": new_user.email_address})

    return {"message": "Email verified successfully",
            "jwt_token": jwt_token,
            "token_type": "bearer"
            }


# This method is to handle a user login (checks if the email exists and the entered password (hashed) matches that in the database)
@app.post("/login")
def login_user(request: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email_address == request.email).first()

    # if the email is not found in the database
    if not user:
        raise HTTPException(status_code=404, detail="Account not found. Please sign up first")
    
    if not pwd_context.verify(request.password, user.password):
        raise HTTPException(status_code=401, detail="Incorrect password")
    
    jwt_token = create_jwt_token(data={"sub": user.email_address})
    # print(f"User {request.email} logged in successfully w jwt token: {jwt_token}")

    
    return {"jwt_token": jwt_token, "token_type": "bearer"}


def get_matching_user(request: Request, db: Session = Depends(get_db)):
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing or invalid Authorization header",
        )

    token = auth_header.split(" ")[1]
    email = verify_jwt_token(token)  # this now raises 401 if token invalid

    user = db.query(models.User).filter(models.User.email_address == email).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found"
        )

    return user

         

# This method handles submission of the original user profile setup (basically just takes the data from the frontend and stores it in the database)
@app.post("/user-profile-setup")
def setup_user_profile(request: UserProfileRequest, db: Session = Depends(get_db), matching_user: User = Depends(get_matching_user)):
    try:
        new_user_profile = models.UserProfile(
            user_id = matching_user.id,
            full_name = request.full_name,
            age = request.age,
            bio=request.bio,
            course=request.course,
            accommodation=request.accommodation,
            nickname=request.nickname,
            university_year=request.university_year,
            languages=request.languages,
            ethnicities=request.ethnicities,
            home_area=request.home_area,
            fun_fact = request.fun_fact,
            societies = request.societies,
            sports = request.sports,
            gym_goer = request.gym_goer

        )

        db.add(new_user_profile)
        db.commit()
        db.refresh(new_user_profile)
   
        return {"message": "User created successfully,", "user's name": new_user_profile.full_name}

    except Exception as e:
        print("Error inserting user_profile", e)

        raise HTTPException(status_code=400, detail=str(e))

# This gets user profiles from the db and is used to display them on the friends-finder page.
@app.get("/user-profiles", response_model=List[UserProfileResponse])
def list_user_profiles(db: Session = Depends(get_db)):
    """
    Return a list of all user profiles.
    """
    try:
        profiles = db.query(models.UserProfile).all()
        return profiles
    except Exception as e:
        print("Error fetching user profiles", e)
        raise HTTPException(status_code=500, detail="Error fetching user profiles")
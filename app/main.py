import os
import secrets
from datetime import datetime, timedelta, timezone
from typing import Annotated

from fastapi import Depends, FastAPI, HTTPException, Request, Response, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi_mail import ConnectionConfig, FastMail, MessageSchema, MessageType
from passlib.context import CryptContext
from sqlalchemy.orm import Session
from starlette.responses import JSONResponse

from app import models
from app.database import SessionLocal, engine
from app.models import User, MatchedUsers
from app.schemas import (
    BatchIDRequest,
    EmailRequest,
    LoginRequest,
    UserProfileRequest,
    UserProfileResponse,
    VerifyCodeRequest,
)
from app.utils.jwt_handler import create_jwt_token, verify_jwt_token

app = FastAPI()

# CORS settings
origins = [
    "http://localhost:5173",  # frontend URL,
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
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
    VALIDATE_CERTS=True,
)


@app.get("/")
def health():
    return {"status": "ok"}


# This method sends 6 digit verification code to ensure user is a surrey student
@app.post("/send-verification-code")
async def send_verification_code(request: EmailRequest, db: Annotated[Session, Depends(get_db)]):
    verification_code = str(secrets.randbelow(900000) + 100000) # Creates a random 6 digit number

    # check to see if there is already an existing user with this email (in which case they cannot sign up again)
    existing_user = db.query(models.User).filter(models.User.email_address == request.email).first()
    if existing_user:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="User with this email already exists")

    existing_record = db.query(models.EmailVerificationCode).filter_by(email= request.email).first()

    if existing_record:
        existing_record.code = verification_code
        existing_record.created_at = datetime.now(timezone.utc)
        existing_record.expires_at = datetime.now(timezone.utc) + timedelta(minutes=10)
        existing_record.verified = False
    else:
        new_record = models.EmailVerificationCode(
            email=request.email,
            code=verification_code,
        )
        db.add(new_record)

    db.commit()


    html = f"<p>Hi! Thank you for signing up to Surreal. Your verification code is: {verification_code}</p>"

    message = MessageSchema(
        subject="Your Surreal Verification Code",
        recipients=[request.email],
        body=html,
        subtype=MessageType.html,
    )

    fm = FastMail(conf)
    await fm.send_message(message)
    return JSONResponse(status_code=200, content= {"message": "email has been sent"})


# hash password before storing in db for security
pwd_context = CryptContext(schemes=["argon2"])

# This method checks if the 6 digit code they entered is correct (compares the value in the database for their email)
@app.post("/verify-code")
def verify_code(request: VerifyCodeRequest, db: Annotated[Session, Depends(get_db)]):
    # get the record with email from previous step
    record = db.query(models.EmailVerificationCode).filter(models.EmailVerificationCode.email == request.email).first()

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
        created_at = datetime.now(timezone.utc),
    )

    db.add(new_user)
    record.verified = True
    db.commit()
    db.refresh(record)

    jwt_token = create_jwt_token(data={
        "sub": str(new_user.id),
        "email": new_user.email_address,
        "name": "New User", # default name until they set up profile
    })

    response = JSONResponse(content={
        "message": "Email verified successfully",
        "user_id": str(new_user.id),
        "user_name": "New User",
    })

    response.set_cookie(
        key="access_token",
        value=jwt_token,
        httponly=True,
        secure=False,  # Set to True in production with HTTPS
        samesite="lax",
        max_age=3600,
    )

    return response


# This method is to handle a user login (checks if the email exists and the entered password (hashed) matches that in the database)
@app.post("/login")
def login_user(request: LoginRequest, db: Annotated[Session, Depends(get_db)]):
    user = db.query(models.User).filter(models.User.email_address == request.email).first()

    # if the email is not found in the database
    if not user:
        raise HTTPException(status_code=404, detail="Account not found. Please sign up first")

    if not pwd_context.verify(request.password, user.password):
        raise HTTPException(status_code=401, detail="Incorrect password")

    # Get profile info
    display_name = "Placeholder"
    profile  = db.query(models.UserProfile).filter(models.UserProfile.user_id == user.id).first()
    if profile:
        display_name = profile.username or profile.full_name or "Placeholder"

    # Generate JWT token
    jwt_token = create_jwt_token(data={
        "sub": str(user.id),
        "email": user.email_address,
        "name": display_name,
    })

    # Create response
    response = JSONResponse(content={
        "message": "Login successful",
        "user_id": str(user.id),
        "user_name": display_name,
    })

    # Set cookie
    response.set_cookie(
        key="access_token",
        value=jwt_token,
        httponly=True,
        secure=False,  # Set to True in production with HTTPS
        samesite="lax",
        max_age=3600,
    )

    # print(f"User {request.email} logged in successfully w jwt token: {jwt_token}")

    return response

@app.post("/logout")
def logout(response: Response):
    response.delete_cookie(key="access_token")
    return {"message": "Logged out successfully"}


def get_current_user(request: Request, db: Annotated[Session, Depends(get_db)]):
    token = request.cookies.get("access_token")

    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
        )

    user_id = verify_jwt_token(token)

    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
        )

    return user


# This method handles submission of the original user profile setup (basically just takes the data from the frontend and stores it in the database)
@app.post("/user-profile-setup")
def setup_user_profile(request: UserProfileRequest, db: Annotated[Session, Depends(get_db)], current_user: Annotated[User, Depends(get_current_user)]):
    try:
        new_user_profile = models.UserProfile(
            user_id = current_user.id,
            full_name = request.full_name,
            age = request.age,
            bio=request.bio,
            course=request.course,
            accommodation=request.accommodation,
            username=request.username,
            university_year=request.university_year,
            languages=request.languages,
            ethnicities=request.ethnicities,
            home_area=request.home_area,
            fun_fact = request.fun_fact,
            societies = request.societies,
            sports = request.sports,
            gym_goer = request.gym_goer,
        )

        db.add(new_user_profile)
        db.commit()
        db.refresh(new_user_profile)

        insert_matched_users(db, current_user)

        new_token = create_jwt_token(data={
            "sub": str(current_user.id),
            "email": current_user.email_address,
            "name": new_user_profile.username,
        })

        return {
            "message": "User created successfully,",
            "user's name": new_user_profile.full_name,
            "jwt_token": new_token,
        }

    except Exception as e:
        print("Error inserting user_profile", e)

        raise HTTPException(status_code=400, detail=str(e))

# This gets user profiles from the db and is used to display them on the friends-finder page.
@app.get("/user-profiles", response_model=list[UserProfileResponse])
def list_user_profiles(db: Annotated[Session, Depends(get_db)]):
    """Return a list of all user profiles."""
    try:
        profiles = db.query(models.UserProfile).all()
        return profiles
    except Exception as e:
        print("Error fetching user profiles", e)
        raise HTTPException(status_code=500, detail="Error fetching user profiles")

@app.get("/users/search")
def search_user(username: str, db: Annotated[Session, Depends(get_db)]):
    """Find a user ID via their username."""
    user = db.query(models.UserProfile).filter(models.UserProfile.username == username).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return {"user_id": str(user.user_id), "display_name": user.username}

@app.post("/users/retrieve")
def retrieve_users(payload: BatchIDRequest, db: Annotated[Session, Depends(get_db)]):
    """Retrieve UUIDs to names in batches."""
    profiles = db.query(models.UserProfile).filter(models.UserProfile.user_id.in_(payload.user_ids)).all()

    return {str(p.user_id): p.username for p in profiles}

@app.get("/validate-token")
def validate_token(current_user: Annotated[User, Depends(get_current_user)]):
    return {
        "user_id": str(current_user.id),
        "user_name": current_user.user_profile.username if current_user.user_profile else "Unknown",
    }


def compare_profiles(current_user: User, db: Session):

    profile = current_user.user_profile  

    logged_in_profile = {
        "id": profile.user_id,
        "age": profile.age,
        "course": profile.course,
        "accommodation": profile.accommodation,
        "university_year": profile.university_year,
        "languages": profile.languages, # array
        "ethnicities": profile.ethnicities, # array
        "societies": profile.societies, # array
        "sports": profile.sports, # array
        "gym_goer": profile.gym_goer,
    }

    all_profiles = db.query(models.UserProfile).all()

    single_attrs = ["age", "course", "accommodation", "university_year", "gym_goer"]
    list_attrs = ["languages", "ethnicities", "societies", "sports"]

    matched_user_ids = []  # UUIDs of matched users


    for p in all_profiles:

        # Don't compare with own profile
        if str(p.user_id) == str(logged_in_profile["id"]):
            continue

        match = False

        for attr in single_attrs:
            if getattr(p, attr) == logged_in_profile[attr]:
                match = True
                break

        if not match:
            for attr in list_attrs:
                other_values = getattr(p, attr) or []
                logged_values = logged_in_profile[attr] or []

                if set(other_values) & set(logged_values):  # any common value?
                    match = True
                    break

        if match:
            matched_user_ids.append(str(p.user_id))

    return matched_user_ids


@app.get("/compare-profiles")
def compare_profiles_route(
    db: Annotated[Session, Depends(get_db)],
    current_user: User = Depends(get_current_user)
):
    return compare_profiles(current_user, db)


# function to insert data into matched_users table
@app.post("/insert-matched-users")
# def insert_matched_users(db: Session, current_user: User):
def insert_matched_users(
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)]
):

    try:
        matched_ids = compare_profiles(current_user, db)

        for other_user_id in matched_ids:
            exists = db.query(models.MatchedUsers).filter(
                ((models.MatchedUsers.user1_id == current_user.id) &
                (models.MatchedUsers.user2_id == other_user_id)) |
                ((models.MatchedUsers.user1_id == other_user_id) &
                (models.MatchedUsers.user2_id == current_user.id))
            ).first()

            if not exists:
                new_row = models.MatchedUsers(
                    user1_id=current_user.id,
                    user2_id=other_user_id
                )
                db.add(new_row)

        db.commit()

        return {
            "message": "Matched user pair successfully saved"
            # "logged_in_user": str(current_user.id),
            # "matched_profiles": matched_ids,
            # "match_count": len(matched_ids)
        }
    
    except Exception as e:
        print("Error inserting matched users", e)
        raise HTTPException(status_code=400, detail=str(e))


@app.get("/matched-profiles", response_model=list[UserProfileResponse])
def get_matched_profiles(
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)]
):
    try:
        # Rows where current user is involved
        matches = db.query(models.MatchedUsers).filter(
            (models.MatchedUsers.user1_id == current_user.id) |
            (models.MatchedUsers.user2_id == current_user.id)
        ).all()

        # The other user of those matched_user pairings
        matched_user_ids = []
        for match in matches:
            if match.user1_id == current_user.id:
                matched_user_ids.append(match.user2_id)
            else:
                matched_user_ids.append(match.user1_id)

        if not matched_user_ids:
            return []

        # Fetch profiles for matched users
        profiles = db.query(models.UserProfile).filter(
            models.UserProfile.user_id.in_(matched_user_ids)
        ).all()

        return profiles

    except Exception as e:
        print("Error fetching matched profiles", e)
        raise HTTPException(status_code=500, detail="Error fetching matched profiles")

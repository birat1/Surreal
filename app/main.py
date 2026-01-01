import io
import logging
import os
import secrets
from datetime import datetime, timedelta, timezone
from typing import Annotated

from fastapi import BackgroundTasks, Depends, FastAPI, File, HTTPException, Request, Response, UploadFile, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi_mail import ConnectionConfig, FastMail, MessageSchema, MessageType
from passlib.context import CryptContext
from PIL import Image
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session
from starlette.responses import JSONResponse

from app import models
from app.database import SessionLocal, engine
from app.models import User
from app.schemas import (
    BatchIDRequest,
    EmailRequest,
    LoginRequest,
    UserProfileRequest,
    UserProfileResponse,
    VerifyCodeRequest,
)
from app.scores import list_attrs_points, single_attrs_points
from app.utils.jwt_handler import create_jwt_token, verify_jwt_token
from app.utils.s3 import delete_image_from_s3, upload_image_to_s3

logger = logging.getLogger("__name__")

app = FastAPI()

# CORS settings
origins = [
    "http://localhost:5173",  # frontend URL,
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
    MAIL_USERNAME=sender_email,
    MAIL_PASSWORD=app_password.replace(" ", ""),
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
    verification_code = str(secrets.randbelow(900000) + 100000)  # Creates a random 6 digit number

    # check to see if there is already an existing user with this email (in which case they cannot sign up again)
    existing_user = db.query(models.User).filter(models.User.email_address == request.email).first()
    if existing_user:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="User with this email already exists")

    existing_record = db.query(models.EmailVerificationCode).filter_by(email=request.email).first()

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
    return JSONResponse(status_code=200, content={"message": "email has been sent"})


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
        email_address=request.email,
        password=hashed_password,
        created_at=datetime.now(timezone.utc),
    )

    db.add(new_user)
    record.verified = True
    db.commit()
    db.refresh(record)

    jwt_token = create_jwt_token(
        data={
            "sub": str(new_user.id),
            "email": new_user.email_address,
            "name": "New User",  # default name until they set up profile
        },
    )

    response = JSONResponse(
        content={
            "message": "Email verified successfully",
            "user_id": str(new_user.id),
            "user_name": "New User",
        },
    )

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
    is_admin = False
    profile = db.query(models.UserProfile).filter(models.UserProfile.user_id == user.id).first()
    if profile:
        display_name = profile.username or profile.full_name or "Placeholder"
        profile_picture = profile.profile_picture
        is_admin = profile.is_admin

    # Generate JWT token
    jwt_token = create_jwt_token(
        data={
            "sub": str(user.id),
            "email": user.email_address,
            "name": display_name,
            "is_admin": is_admin,
        },
    )

    # Create response
    response = JSONResponse(
        content={
            "message": "Login successful",
            "user_id": str(user.id),
            "user_name": display_name,
            "profile_picture": profile_picture,
            "is_admin": is_admin,
        },
    )

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
def setup_user_profile(
    request: UserProfileRequest,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
):
    try:
        new_user_profile = models.UserProfile(
            user_id=current_user.id,
            full_name=request.full_name,
            is_admin=request.is_admin,
            age=request.age,
            bio=request.bio,
            course=request.course,
            accommodation=request.accommodation,
            username=request.username,
            university_year=request.university_year,
            languages=request.languages,
            ethnicities=request.ethnicities,
            home_area=request.home_area,
            fun_fact=request.fun_fact,
            societies=request.societies,
            sports=request.sports,
            gym_goer=request.gym_goer,
            show_bio=request.show_bio,
            show_accommodation=request.show_accommodation,
            show_languages=request.show_languages,
            show_ethnicities=request.show_ethnicities,
            show_home_area=request.show_home_area,
            show_societies=request.show_societies,
            show_sports=request.show_sports,
            show_gym_goer=request.show_gym_goer,
        )

        db.add(new_user_profile)
        db.commit()
        db.refresh(new_user_profile)

        recompute_matches(current_user, db)

        new_token = create_jwt_token(
            data={
                "sub": str(current_user.id),
                "email": current_user.email_address,
                "name": new_user_profile.username,
                "is_admin": new_user_profile.is_admin,
            },
        )

        response = JSONResponse(
            content={
                "message": "User created successfully",
                "user_id": str(current_user.id),
                "user_name": new_user_profile.username,
                "is_admin": new_user_profile.is_admin,
            },
        )

        # Set the updated cookie
        response.set_cookie(
            key="access_token",
            value=new_token,
            httponly=True,
            secure=False,
            samesite="lax",
            max_age=3600,
        )
        return response

    except IntegrityError as e:
        db.rollback()
        error_str = str(e.orig)

        if "user_profiles_user_id_key" in error_str:
            raise HTTPException(status_code=400, detail="You already have a profile")

        raise HTTPException(status_code=400, detail="Invalid profile data")

    except Exception as e:
        print("Error inserting user_profile", e)
        raise HTTPException(status_code=500, detail="Something went wrong while creating your profile")


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
    profile_picture = None
    user_name = "Unknown"
    is_admin = False

    if current_user.user_profile:
        user_name = current_user.user_profile.username
        profile_picture = current_user.user_profile.profile_picture
        is_admin = current_user.user_profile.is_admin

    return {
        "user_id": str(current_user.id),
        "user_name": user_name,
        "profile_picture": profile_picture,
        "is_admin": is_admin,
    }


def compare_profiles(current_user: User, db: Session):
    profile = current_user.user_profile

    logged_in_profile = {
        "id": profile.user_id,
        "age": profile.age,
        "course": profile.course,
        "accommodation": profile.accommodation,
        "university_year": profile.university_year,
        "languages": profile.languages,  # array
        "ethnicities": profile.ethnicities,  # array
        "societies": profile.societies,  # array
        "sports": profile.sports,  # array
        "gym_goer": profile.gym_goer,
    }

    all_profiles = db.query(models.UserProfile).all()

    results = []  # stores the UUID & score of a profile

    for p in all_profiles:
        # Don't compare with own profile
        if str(p.user_id) == str(logged_in_profile["id"]):
            continue

        score = 0

        for attr, points in single_attrs_points.items():
            if getattr(p, attr) == logged_in_profile[attr]:
                score += points

        for attr, points in list_attrs_points.items():
            other_values = set(getattr(p, attr) or [])
            logged_values = set(logged_in_profile[attr] or [])

            # if there are any common values, add points for each common value there is
            common_values = other_values & logged_values
            score += len(common_values) * points

        if score > 0:
            results.append(
                {
                    "user_id": p.user_id,
                    "score": score,
                }
            )

    # sort results by score, highest first
    results.sort(key=lambda x: x["score"], reverse=True)
    return results


@app.get("/compare-profiles")
def compare_profiles_route(db: Annotated[Session, Depends(get_db)], current_user: User = Depends(get_current_user)):
    return compare_profiles(current_user, db)


"""
New method to replace insert_matched_users:
takes into consideration that after a user edits their profile, scores can change, so 
an existing matched user pair could be deleted or a new pair be created.
"""


def recompute_matches(user: models.User, db: Session):
    scored_matches = compare_profiles(user, db)

    db.query(models.MatchedUsers).filter(
        (models.MatchedUsers.user1_id == user.id) | (models.MatchedUsers.user2_id == user.id)
    ).delete(synchronize_session=False)

    for match in scored_matches:
        other_user_id = match["user_id"]
        score = match["score"]

        user1_id, user2_id = sorted([user.id, other_user_id])

        db.add(models.MatchedUsers(user1_id=user1_id, user2_id=user2_id, score=score))

    db.commit()


@app.get("/matched-profiles", response_model=list[UserProfileResponse])
def get_matched_profiles(
    db: Annotated[Session, Depends(get_db)], current_user: Annotated[User, Depends(get_current_user)]
):
    try:
        # Rows where current user is involved
        matches = (
            db.query(models.MatchedUsers)
            .filter(
                (models.MatchedUsers.user1_id == current_user.id) | (models.MatchedUsers.user2_id == current_user.id)
            )
            .order_by(models.MatchedUsers.score.desc())
            .all()  # return users with high matching scores first
        )

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
        profiles = db.query(models.UserProfile).filter(models.UserProfile.user_id.in_(matched_user_ids)).all()

        profiles_dict = {str(p.user_id): p for p in profiles}
        ordered_profiles = [profiles_dict[str(uid)] for uid in matched_user_ids if str(uid) in profiles_dict]

        return ordered_profiles

    except Exception as e:
        print("Error fetching matched profiles", e)
        raise HTTPException(status_code=500, detail="Error fetching matched profiles")


@app.post("/user-profile-picture")
async def upload_profile_picture(
    background_tasks: BackgroundTasks,
    file: Annotated[UploadFile, File()],
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
):
    allowed_types = {"image/jpeg", "image/jpg", "image/png", "image/webp"}
    if file.content_type not in allowed_types:
        raise HTTPException(status_code=400, detail="Only JPG/PNG/WEBP allowed")

    content = await file.read()

    MAX_FILE_SIZE = 5 * 1024 * 1024
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(status_code=413, detail="File size exceeds 5MB limit.")

    try:
        image = Image.open(io.BytesIO(content))

        if image.mode in ("RGBA", "P"):
            image = image.convert("RGB")

        width, height = image.size
        new_size = min(width, height)

        left = (width - new_size) // 2
        top = (height - new_size) // 2

        image = image.crop((left, top, left + new_size, top + new_size))
        image.thumbnail((500, 500), Image.Resampling.LANCZOS)

        buffer = io.BytesIO()
        image.save(buffer, format="WEBP", quality=80, optimize=True)
        compressed_content = buffer.getvalue()

    except Exception as e:
        logger.exception(f"Error processing image: {e}")
        raise HTTPException(status_code=400, detail="Invalid image file.")

    profile = db.query(models.UserProfile).filter(models.UserProfile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(status_code=400, detail="Create profile first, then upload picture")

    # Upload new image to S3
    try:
        s3_url = upload_image_to_s3(str(current_user.id), compressed_content)

        # Update database with new S3 URL
        old_picture_url = profile.profile_picture
        profile.profile_picture = s3_url
        db.commit()
        db.refresh(profile)

        # Delete old image from S3 if it exists and if it's not a seeded asset
        if old_picture_url and "/seeded/" not in old_picture_url:
            background_tasks.add_task(delete_image_from_s3, old_picture_url)

        return {
            "message": "Profile picture updated",
            "profile_picture": s3_url,
        }
    except Exception as e:
        logger.error(f"Failed to upload to S3: {e}")
        raise HTTPException(status_code=500, detail="Failed to upload image to storage")


# This is to get the current user's existing data
@app.get("/user-profile/me", response_model=UserProfileResponse)
def get_existing_profile(
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
):
    profile = db.query(models.UserProfile).filter(models.UserProfile.user_id == current_user.id).first()

    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")

    return profile


# endpoint for the edit profile page
@app.put("/edit-user-profile")
def edit_user_profile(
    request: UserProfileRequest,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
):
    profile = db.query(models.UserProfile).filter(models.UserProfile.user_id == current_user.id).first()

    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")

    profile.full_name = request.full_name
    profile.is_admin = request.is_admin
    profile.age = request.age
    profile.bio = request.bio
    profile.course = request.course
    profile.accommodation = request.accommodation
    profile.username = request.username
    profile.university_year = request.university_year
    profile.languages = request.languages
    profile.ethnicities = request.ethnicities
    profile.home_area = request.home_area
    profile.fun_fact = request.fun_fact
    profile.societies = request.societies
    profile.sports = request.sports
    profile.gym_goer = request.gym_goer

    profile.show_bio = request.show_bio
    profile.show_accommodation = request.show_accommodation
    profile.show_languages = request.show_languages
    profile.show_ethnicities = request.show_ethnicities
    profile.show_home_area = request.show_home_area
    profile.show_societies = request.show_societies
    profile.show_sports = request.show_sports
    profile.show_gym_goer = request.show_gym_goer

    try:
        db.commit()
        db.refresh(profile)
        recompute_matches(current_user, db)

        new_token = create_jwt_token(
            data={
                "sub": str(current_user.id),
                "email": current_user.email_address,
                "name": profile.username,
                "is_admin": profile.is_admin,
            },
        )

        response = JSONResponse(
            content={
                "message": "Profile updated successfully",
                "user_id": str(current_user.id),
                "user_name": profile.username,
                "is_admin": profile.is_admin,
            },
        )

        response.set_cookie(
            key="access_token",
            value=new_token,
            httponly=True,
            secure=False,
            samesite="lax",
            max_age=3600,
        )

        return response

    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="There is a problem updating your profile")

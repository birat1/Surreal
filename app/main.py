from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, SessionLocal
from app import models
from typing import Annotated, List
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from fastapi_mail import FastMail, MessageSchema, ConnectionConfig, MessageType
from starlette.responses import JSONResponse
import random
import os
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

class EmailRequest(BaseModel):
    email: EmailStr

conf = ConnectionConfig(
    MAIL_USERNAME= sender_email,
    MAIL_PASSWORD=app_password.replace(" ",""),
    MAIL_FROM=sender_email,
    MAIL_PORT=587,
    MAIL_SERVER="smtp.gmail.com",
    MAIL_FROM_NAME="Surreal App",  # This is what the user sees as sender
    MAIL_STARTTLS=True,            
    MAIL_SSL_TLS=False,
    USE_CREDENTIALS=True,
    VALIDATE_CERTS=True
)


# This method sends 6 digit verification code to ensure user is a surrey student
@app.post("/send-verification-code")
async def send_verification_code(request: EmailRequest, db: Session = Depends(get_db)):
    email = request.email
    verification_code = str(random.randint(100000, 999999)) # Creates a random 6 digit number

    existing_record = db.query(models.EmailVerificationCode).filter_by(email=email).first()

    if existing_record:
        existing_record.code = verification_code
        existing_record.created_at = datetime.utcnow()
        existing_record.expires_at = datetime.utcnow() + timedelta(minutes=10)
        existing_record.verified = False
    else:
        new_record = models.EmailVerificationCode(
            email=email,
            code=verification_code
        )
        db.add(new_record)

    db.commit()


    html = f"<p>Hi! Thank you for signing up to Surreal. Your verification code is: {verification_code}</p>"

    message = MessageSchema(
        subject="Your Surreal Verification Code",
        recipients=[email],
        body=html,
        subtype=MessageType.html
    )

    fm = FastMail(conf)
    await fm.send_message(message)
    return JSONResponse(status_code=200, content= {"message": "email has been sent"})


class VerifyCodeRequest(BaseModel):
    email: EmailStr
    password: str
    code: str


# hash password before storing in db for security
pwd_context = CryptContext(schemes=["argon2"])

# This method checks if the 6 digit code they entered is correct (matches the value in the database for their email)
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

    existing_user = db.query(models.User).filter(models.User.email_address == request.email).first()
    if existing_user:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="User with this email already exists")
    

    new_user = models.User(
        email_address = request.email,
        password = hashed_password,
        created_at = datetime.utcnow()
    )

    db.add(new_user)
    record.verified = True
    db.commit()
    db.refresh(record)

    return {"message": "Email verified successfully"}
 

@app.get("/")
def health():
    return {"status": "ok"}


# class SignUpRequest(BaseModel):
#     full_name: str
#     age: int
#     nickname: str
#     bio: str
#     course: str
#     accomodation: str
#     university_year: int
#     languages: str
#     ethnicity: str
#     home_area: str










# this function receives the values from the user signup form and inserts it into the postgres database
# @app.post("/signup")
# def signup_user(request: SignUpRequest, db: Session = Depends(get_db)):

#     print("Received request: ", request.model_dump())

#     try:
#         new_user = models.User(
#             full_name = request.full_name,
#             age = request.age,
#             nickname=request.nickname,
#             bio=request.bio,
#             course=request.course,
#             accomodation=request.accomodation,
#             university_year=request.university_year,
#             languages=request.languages,
#             ethnicity=request.ethnicity,
#             home_area=request.home_area
#         )
   
#         db.add(new_user)
#         db.commit()
#         db.refresh(new_user)
   
#         return {"message": "User created successfully,", "user's name": new_user.full_name}

#     except Exception as e:
#         print("Error inserting user", e)

#         raise HTTPException(status_code=400, detail=str(e))

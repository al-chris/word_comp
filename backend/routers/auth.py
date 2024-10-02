# app/routers/auth.py

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Optional
from ..schemas import UserCreate, UserOut, Token
from ..models import User
from ..database import SessionLocal
from ..utils.security import hash_password, verify_password, create_access_token
import uuid
from pydantic import BaseModel

router = APIRouter(
    prefix="/auth",
    tags=["auth"],
)

class Token(BaseModel):
    access_token: str
    token_type: str

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def generate_uid() -> str:
    return str(uuid.uuid4())

@router.post("/register/", response_model=Token)
def register(user: UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.name == user.name).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Username already registered")
    hashed_pw = hash_password(user.password)
    new_user = User(name=user.name, hashed_password=hashed_pw, uid=generate_uid())
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    access_token = create_access_token(data={"sub": new_user.name, "uid": new_user.uid, "id": new_user.id})
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/login/", response_model=Token)
def login(credentials: UserCreate, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.name == credentials.name).first()
    if not user or not verify_password(credentials.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    access_token = create_access_token(data={"sub": user.name, "uid": user.uid, "id": user.id})
    return {"access_token": access_token, "token_type": "bearer"}

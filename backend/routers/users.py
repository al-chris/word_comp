# app/routers/users.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from ..schemas import UserOut
from ..models import User
from ..database import SessionLocal
from ..utils.security import decode_access_token
from fastapi.security import OAuth2PasswordBearer

router = APIRouter(
    prefix="/users",
    tags=["users"],
)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User:
    payload = decode_access_token(token)
    if payload is None:
        raise HTTPException(status_code=401, detail="Invalid token")
    user = db.query(User).filter(User.id == payload.get("id")).first()
    if user is None:
        raise HTTPException(status_code=401, detail="User not found")
    return user

@router.get("/search", response_model=List[UserOut])
def search_users(query: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    users = db.query(User).filter(
        (User.name.ilike(f"%{query}%")) | (User.uid.ilike(f"%{query}%"))
    ).all()
    return users

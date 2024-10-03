# app/routers/sessions.py

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from pydantic import BaseModel  # Add this import
from ..schemas import SessionCreate, SessionOut, JoinSession
from ..models import Session as GameSession, Story, Player, User
from ..database import SessionLocal
from ..utils.security import decode_access_token
from fastapi.security import OAuth2PasswordBearer

router = APIRouter(
    prefix="/sessions",
    tags=["sessions"],
)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login/")

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

@router.post("/", response_model=SessionOut)
def create_session(session: SessionCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    existing_session = db.query(GameSession).filter(GameSession.title == session.title).first()
    if existing_session:
        raise HTTPException(status_code=400, detail="Session title already exists")
    new_session = GameSession(title=session.title, creator_id=current_user.id)
    db.add(new_session)
    db.commit()
    db.refresh(new_session)
    # Initialize Story
    new_story = Story(session_id=new_session.id, content="")
    db.add(new_story)
    db.commit()
    # Add creator as player
    player = Player(session_id=new_session.id, user_id=current_user.id)
    db.add(player)
    db.commit()
    return new_session

@router.get("/", response_model=List[SessionOut])
def get_sessions(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    sessions = db.query(GameSession).filter(GameSession.is_active == True).all()
    return sessions

@router.post("/join/", response_model=dict)
def join_session(join: JoinSession, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    session_id = join.session_id
    session = db.query(GameSession).filter(GameSession.id == session_id, GameSession.is_active == True).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found or inactive")
    existing_player = db.query(Player).filter(Player.session_id == session_id, Player.user_id == current_user.id).first()
    if existing_player:
        raise HTTPException(status_code=400, detail="Already joined")
    player = Player(session_id=session_id, user_id=current_user.id)
    db.add(player)
    db.commit()
    return {"detail": "Joined session successfully"}

@router.post("/leave/", response_model=dict)
def leave_session(session_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    player = db.query(Player).filter(Player.session_id == session_id, Player.user_id == current_user.id).first()
    if not player:
        raise HTTPException(status_code=404, detail="Player not found in session")
    db.delete(player)
    db.commit()
    return {"detail": "Left session successfully"}

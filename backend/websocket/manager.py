# Install dependencies:
# pip install "python-socketio[asyncio]" "uvicorn" "fastapi"

import socketio
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from database import SessionLocal
from models import User, GameSession, Story, Player
from utils.security import decode_access_token
from sqlalchemy.orm import Session

sio = socketio.AsyncServer(async_mode='asgi', cors_allowed_origins='*')
app = FastAPI()
sio_app = socketio.ASGIApp(sio, other_asgi_app=app)

app.mount("/", sio_app)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Event Handlers
@sio.event
async def connect(sid, environ):
    print(f"Client connected: {sid}")

@sio.event
async def authenticate(sid, data):
    token = data.get("token")
    db = SessionLocal()
    payload = decode_access_token(token)
    if payload is None:
        await sio.emit("error", {"message": "Authentication failed"}, to=sid)
        return False
    user = db.query(User).filter(User.id == payload.get("id")).first()
    if user is None:
        await sio.emit("error", {"message": "User not found"}, to=sid)
        return False
    sio.enter_room(sid, f"user_{user.id}")
    sio.save_session(sid, {"user_id": user.id})
    await sio.emit("authenticated", {"message": "Authentication successful"}, to=sid)
    db.close()
    return True

@sio.event
async def join_session(sid, data):
    session_id = data.get("session_id")
    db = SessionLocal()
    session = db.query(GameSession).filter(GameSession.id == session_id, GameSession.is_active == True).first()
    if not session:
        await sio.emit("error", {"message": "Session not found or inactive"}, to=sid)
        db.close()
        return
    user_id = sio.get_session(sid).get("user_id")
    # Add to room
    sio.enter_room(sid, f"session_{session_id}")
    # Notify others
    await sio.emit("player_joined", {"user_id": user_id}, room=f"session_{session_id}")
    db.close()

@sio.event
async def leave_session(sid, data):
    session_id = data.get("session_id")
    user_id = sio.get_session(sid).get("user_id")
    sio.leave_room(sid, f"session_{session_id}")
    await sio.emit("player_left", {"user_id": user_id}, room=f"session_{session_id}")

@sio.event
async def submit_content(sid, data):
    session_id = data.get("session_id")
    content = data.get("content")
    db = SessionLocal()
    story = db.query(Story).filter(Story.session_id == session_id).first()
    if not story:
        await sio.emit("error", {"message": "Story not found"}, to=sid)
        db.close()
        return
    story.content += f" {content}"
    db.commit()
    # Broadcast updated story
    await sio.emit("story_update", {"content": story.content}, room=f"session_{session_id}")
    db.close()

@sio.event
async def disconnect(sid):
    print(f"Client disconnected: {sid}")
    # Handle user leaving rooms, notify others, etc.
    # Implementation depends on tracking user-session relationships

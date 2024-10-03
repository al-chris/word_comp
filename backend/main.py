# app/main.py

import socketio
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from .routers import auth, users, sessions
from .database import Base, engine
from .models import User, Session as GameSession, Story, Player
from .utils.security import decode_access_token
from sqlalchemy.orm import Session
from .database import SessionLocal
import asyncio

# Create database tables
Base.metadata.create_all(bind=engine)

# Initialize FastAPI
fastapi_app = FastAPI()

# CORS Middleware with explicit Authorization header
fastapi_app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["Authorization", "Content-Type"],
)

# Include Routers
fastapi_app.include_router(auth.router)
fastapi_app.include_router(users.router)
fastapi_app.include_router(sessions.router)

# Initialize Socket.IO
sio = socketio.AsyncServer(async_mode='asgi', cors_allowed_origins='*')
sio_app = socketio.ASGIApp(sio, other_asgi_app=fastapi_app)

# In-memory turn tracking
session_turns = {}

# Constants
INACTIVITY_TIMEOUT = 300  # seconds

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Helper Functions
async def update_player_list(session_id: int):
    db = SessionLocal()
    players = db.query(Player).filter(Player.session_id == session_id).all()
    player_data = [{"user_id": p.user_id, "is_active": p.is_active, "is_paused": p.is_paused} for p in players]
    await sio.emit("update_players", {"players": player_data}, room=f"session_{session_id}")
    db.close()

async def monitor_inactivity(session_id: int, user_id: int):
    await asyncio.sleep(INACTIVITY_TIMEOUT)
    db = SessionLocal()
    player = db.query(Player).filter(Player.session_id == session_id, Player.user_id == user_id).first()
    if player and not player.is_active:
        await sio.emit("user_inactive", {"user_id": user_id}, room=f"session_{session_id}")
        if session_turns.get(session_id, {}).get("players", [])[session_turns[session_id]["current_turn"]] == user_id:
            session_turns[session_id]["current_turn"] = (session_turns[session_id]["current_turn"] + 1) % len(session_turns[session_id]["players"])
            next_user = session_turns[session_id]["players"][session_turns[session_id]["current_turn"]]
            await sio.emit("turn_change", {"user_id": next_user}, room=f"session_{session_id}")
    db.close()

# Socket.IO Event Handlers
@sio.event
async def connect(sid, environ, auth):
    print(f"Client connected: {sid}")
    # Optionally handle authentication here if using query params

@sio.event
async def disconnect(sid):
    print(f"Client disconnected: {sid}")
    # Additional logic to handle user disconnection can be added here

@sio.event
async def authenticate(sid, data):
    token = data.get("token")
    db: Session = SessionLocal()
    payload = decode_access_token(token)
    if payload is None:
        await sio.emit("error", {"message": "Authentication failed"}, to=sid)
        db.close()
        return False
    user = db.query(User).filter(User.id == payload.get("id")).first()
    if user is None:
        await sio.emit("error", {"message": "User not found"}, to=sid)
        db.close()
        return False
    await sio.enter_room(sid, f"user_{user.id}")
    await sio.save_session(sid, {"user_id": user.id})
    await sio.emit("authenticated", {"message": "Authentication successful"}, to=sid)
    db.close()
    return True

@sio.event
async def join_session_event(sid, data):
    try:
        session_id = data.get("session_id")
        db: Session = SessionLocal()
        session = db.query(GameSession).filter(GameSession.id == session_id, GameSession.is_active == True).first()
        if not session:
            await sio.emit("error", {"message": "Session not found or inactive"}, to=sid)
            db.close()
            return
        user_session = await sio.get_session(sid)
        user_id = user_session.get("user_id")
        if not user_id:
            await sio.emit("error", {"message": "User not authenticated"}, to=sid)
            db.close()
            return
        await sio.enter_room(sid, f"session_{session_id}")  # Awaited
        await sio.emit("player_joined", {"user_id": user_id}, room=f"session_{session_id}")
        # Initialize turn order
        if session_id not in session_turns:
            players = db.query(Player).filter(Player.session_id == session_id).all()
            session_turns[session_id] = {"players": [p.user_id for p in players], "current_turn": 0}
        await update_player_list(session_id)
        # Notify about current turn
        current_turn_user = session_turns[session_id]["players"][session_turns[session_id]["current_turn"]]
        await sio.emit("turn_change", {"user_id": current_turn_user}, room=f"session_{session_id}")
        db.close()
    except Exception as e:
        await sio.emit("error", {"message": str(e)}, to=sid)
        print(f"Error in join_session_event: {e}")

@sio.event
async def leave_session_event(sid, data):
    try:
        session_id = data.get("session_id")
        user_session = await sio.get_session(sid)
        user_id = user_session.get("user_id")
        await sio.leave_room(sid, f"session_{session_id}")  # Added 'await'
        await sio.emit("player_left", {"user_id": user_id}, room=f"session_{session_id}")
        # Remove from turn order
        if session_id in session_turns and user_id in session_turns[session_id]["players"]:
            session_turns[session_id]["players"].remove(user_id)
            if session_turns[session_id]["current_turn"] >= len(session_turns[session_id]["players"]):
                session_turns[session_id]["current_turn"] = 0
            await update_player_list(session_id)
            if session_turns[session_id]["players"]:
                current_turn_user = session_turns[session_id]["players"][session_turns[session_id]["current_turn"]]
                await sio.emit("turn_change", {"user_id": current_turn_user}, room=f"session_{session_id}")
    except Exception as e:
        await sio.emit("error", {"message": str(e)}, to=sid)
        print(f"Error in leave_session_event: {e}")

@sio.event
async def submit_content(sid, data):
    try:
        session_id = data.get("session_id")
        content = data.get("content")
        db: Session = SessionLocal()
        story = db.query(Story).filter(Story.session_id == session_id).first()
        if not story:
            await sio.emit("error", {"message": "Story not found"}, to=sid)
            db.close()
            return
        user_session = await sio.get_session(sid)
        user_id = user_session.get("user_id")
        if session_id not in session_turns or not session_turns[session_id]["players"]:
            await sio.emit("error", {"message": "Turn not initialized"}, to=sid)
            db.close()
            return
        current_turn = session_turns[session_id]["current_turn"]
        if session_turns[session_id]["players"][current_turn] != user_id:
            await sio.emit("error", {"message": "Not your turn"}, to=sid)
            db.close()
            return
        if not content.strip():
            await sio.emit("error", {"message": "Content cannot be empty"}, to=sid)
            db.close()
            return
        story.content += f" {content}"
        db.commit()
        await sio.emit("story_update", {"content": story.content}, room=f"session_{session_id}")
        # Advance turn
        session_turns[session_id]["current_turn"] = (current_turn + 1) % len(session_turns[session_id]["players"])
        next_user = session_turns[session_id]["players"][session_turns[session_id]["current_turn"]]
        await sio.emit("turn_change", {"user_id": next_user}, room=f"session_{session_id}")
        db.close()
    except Exception as e:
        await sio.emit("error", {"message": str(e)}, to=sid)
        print(f"Error in submit_content: {e}")

@sio.event
async def pause(sid, data):
    try:
        session_id = data.get("session_id")
        user_session = await sio.get_session(sid)
        user_id = user_session.get("user_id")
        db: Session = SessionLocal()
        player = db.query(Player).filter(Player.session_id == session_id, Player.user_id == user_id).first()
        if player:
            player.is_paused = True
            db.commit()
            await sio.emit("player_paused", {"user_id": user_id}, room=f"session_{session_id}")
        db.close()
    except Exception as e:
        await sio.emit("error", {"message": str(e)}, to=sid)
        print(f"Error in pause: {e}")

@sio.event
async def resume(sid, data):
    try:
        session_id = data.get("session_id")
        user_session = await sio.get_session(sid)
        user_id = user_session.get("user_id")
        db: Session = SessionLocal()
        player = db.query(Player).filter(Player.session_id == session_id, Player.user_id == user_id).first()
        if player:
            player.is_paused = False
            db.commit()
            await sio.emit("player_resumed", {"user_id": user_id}, room=f"session_{session_id}")
        db.close()
    except Exception as e:
        await sio.emit("error", {"message": str(e)}, to=sid)
        print(f"Error in resume: {e}")

@sio.event
async def end_session(sid, data):
    try:
        session_id = data.get("session_id")
        db: Session = SessionLocal()
        session = db.query(GameSession).filter(GameSession.id == session_id).first()
        if session:
            session.is_active = False
            db.commit()
            # AI Completion (Placeholder)
            story = db.query(Story).filter(Story.session_id == session_id).first()
            if story:
                ai_text = " [AI-generated continuation]"
                story.content += f" {ai_text}"
                db.commit()
                await sio.emit("story_update", {"content": story.content}, room=f"session_{session_id}")
            await sio.emit("session_ended", {"session_id": session_id}, room=f"session_{session_id}")
        db.close()
    except Exception as e:
        await sio.emit("error", {"message": str(e)}, to=sid)
        print(f"Error in end_session: {e}")

# Set the main ASGI app to sio_app
# When running with Uvicorn, point to main:app
app = sio_app

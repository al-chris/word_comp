# app/models.py
from sqlalchemy import Column, String, Integer, ForeignKey, Text, Boolean
from sqlalchemy.orm import relationship
from .database import Base

class User(Base):
    __tablename__ = 'users'
    id = Column(Integer, primary_key=True, index=True)
    uid = Column(String, unique=True, index=True)
    name = Column(String, unique=True, index=True)
    hashed_password = Column(String)

class Session(Base):
    __tablename__ = 'sessions'
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, unique=True, index=True)
    creator_id = Column(Integer, ForeignKey('users.id'))
    is_active = Column(Boolean, default=True)
    story = relationship("Story", back_populates="session", uselist=False)
    players = relationship("Player", back_populates="session")

class Story(Base):
    __tablename__ = 'stories'
    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey('sessions.id'))
    content = Column(Text, default="")
    session = relationship("Session", back_populates="story")

class Player(Base):
    __tablename__ = 'players'
    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey('sessions.id'))
    user_id = Column(Integer, ForeignKey('users.id'))
    is_active = Column(Boolean, default=True)
    is_paused = Column(Boolean, default=False)
    session = relationship("Session", back_populates="players")
    user = relationship("User")

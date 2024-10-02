# app/schemas.py
from pydantic import BaseModel
from typing import List, Optional

class UserCreate(BaseModel):
    name: str
    password: str

class UserOut(BaseModel):
    id: int
    uid: str
    name: str

    class Config:
        from_attributes = True

class SessionCreate(BaseModel):
    title: str

class SessionOut(BaseModel):
    id: int
    title: str
    creator_id: int
    is_active: bool

    class Config:
        from_attributes = True

class StoryUpdate(BaseModel):
    content: str

class Token(BaseModel):
    access_token: str
    token_type: str

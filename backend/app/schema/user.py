from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional


class UserCreate(BaseModel):
    """Schema for creating a new user"""
    username: str = Field(..., min_length=1, max_length=25, description="Username (1-25 characters)")
    password: str = Field(..., min_length=8, description="Password (minimum 8 characters)")

    class Config:
        json_schema_extra = {
            "example": {
                "username": "pokerguy",
                "password": "securepass123"
            }
        }


class UserUpdate(BaseModel):
    """Schema for updating user information"""
    username: Optional[str] = Field(None, min_length=1, max_length=25, description="New username")
    password: Optional[str] = Field(None, min_length=8, description="New password")

    class Config:
        json_schema_extra = {
            "example": {
                "username": "newusername",
                "password": "newsecurepass123"
            }
        }


class UserResponse(BaseModel):
    """Schema for user response (no password field)"""
    id: int
    username: str
    created_at: datetime

    class Config:
        from_attributes = True
        json_schema_extra = {
            "example": {
                "id": 1,
                "username": "pokerguy",
                "created_at": "2026-04-08T12:00:00+00:00"
            }
        }

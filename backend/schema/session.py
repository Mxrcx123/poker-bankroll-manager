from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional


class SessionCreate(BaseModel):
    """Schema for creating a new session"""
    user_id: int = Field(..., description="User ID")
    game_mode_id: int = Field(..., description="Game mode ID")
    platform_id: Optional[int] = Field(None, description="Platform ID (optional)")
    notes: Optional[str] = Field(None, description="Session notes")

    class Config:
        json_schema_extra = {
            "example": {
                "user_id": 1,
                "game_mode_id": 1,
                "platform_id": 1,
                "notes": "Good session at the club"
            }
        }


class SessionUpdate(BaseModel):
    """Schema for updating a session"""
    platform_id: Optional[int] = Field(None, description="Platform ID")
    ended_at: Optional[datetime] = Field(None, description="Session end time")
    notes: Optional[str] = Field(None, description="Session notes")

    class Config:
        json_schema_extra = {
            "example": {
                "platform_id": 1,
                "ended_at": "2026-04-08T14:00:00+00:00",
                "notes": "Updated notes"
            }
        }


class SessionResponse(BaseModel):
    """Schema for session response"""
    id: int
    user_id: int
    game_mode_id: int
    platform_id: Optional[int]
    started_at: datetime
    ended_at: Optional[datetime]
    notes: Optional[str]

    class Config:
        from_attributes = True
        json_schema_extra = {
            "example": {
                "id": 1,
                "user_id": 1,
                "game_mode_id": 1,
                "platform_id": 1,
                "started_at": "2026-04-08T12:00:00+00:00",
                "ended_at": "2026-04-08T14:00:00+00:00",
                "notes": "Good session at the club"
            }
        }

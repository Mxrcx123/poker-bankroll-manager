from pydantic import BaseModel, Field
from typing import Optional


class GameModeCreate(BaseModel):
    """Schema for creating a game mode"""
    title: str = Field(..., min_length=1, max_length=50, description="Game mode title")

    class Config:
        json_schema_extra = {
            "example": {
                "title": "Cash"
            }
        }


class GameModeUpdate(BaseModel):
    """Schema for updating a game mode"""
    title: Optional[str] = Field(None, min_length=1, max_length=50, description="Game mode title")

    class Config:
        json_schema_extra = {
            "example": {
                "title": "Multi-Table Tournament (MTT)"
            }
        }


class GameModeResponse(BaseModel):
    """Schema for game mode response"""
    id: int
    title: str

    class Config:
        from_attributes = True
        json_schema_extra = {
            "example": {
                "id": 1,
                "title": "Cash"
            }
        }

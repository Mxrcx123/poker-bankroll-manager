from pydantic import BaseModel, Field
from typing import Optional


class PlatformCreate(BaseModel):
    """Schema for creating a platform"""
    name: str = Field(..., min_length=1, max_length=255, description="Platform name")

    class Config:
        json_schema_extra = {
            "example": {
                "name": "PokerStars"
            }
        }


class PlatformUpdate(BaseModel):
    """Schema for updating a platform"""
    name: Optional[str] = Field(None, min_length=1, max_length=255, description="Platform name")

    class Config:
        json_schema_extra = {
            "example": {
                "name": "GG Poker"
            }
        }


class PlatformResponse(BaseModel):
    """Schema for platform response"""
    id: int
    name: str

    class Config:
        from_attributes = True
        json_schema_extra = {
            "example": {
                "id": 1,
                "name": "PokerStars"
            }
        }

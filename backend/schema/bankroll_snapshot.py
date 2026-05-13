from pydantic import BaseModel, Field
from datetime import datetime
from decimal import Decimal


class BankrollSnapshotCreate(BaseModel):
    """Schema for creating a bankroll snapshot"""
    user_id: int = Field(..., description="User ID")
    amount: Decimal = Field(..., decimal_places=2, description="Bankroll amount")

    class Config:
        json_schema_extra = {
            "example": {
                "user_id": 1,
                "amount": "2500.00"
            }
        }


class BankrollSnapshotUpdate(BaseModel):
    """Schema for updating a bankroll snapshot"""
    amount: Decimal = Field(..., decimal_places=2, description="Bankroll amount")

    class Config:
        json_schema_extra = {
            "example": {
                "amount": "2750.00"
            }
        }


class BankrollSnapshotResponse(BaseModel):
    """Schema for bankroll snapshot response"""
    id: int
    user_id: int
    amount: Decimal
    recorded_at: datetime

    class Config:
        from_attributes = True
        json_schema_extra = {
            "example": {
                "id": 1,
                "user_id": 1,
                "amount": "2500.00",
                "recorded_at": "2026-04-08T12:00:00+00:00"
            }
        }

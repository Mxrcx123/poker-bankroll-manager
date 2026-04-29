from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional
from decimal import Decimal


class BankrollEventCreate(BaseModel):
    """Schema for creating a bankroll event"""
    user_id: int = Field(..., description="User ID")
    amount: Decimal = Field(..., decimal_places=2, description="Transaction amount")
    event_type: str = Field(..., description="Event type (e.g., deposit, withdrawal, session_profit, session_loss, refund, bonus, fee)")
    notes: Optional[str] = Field(None, description="Event notes")

    class Config:
        json_schema_extra = {
            "example": {
                "user_id": 1,
                "amount": "500.00",
                "event_type": "deposit",
                "notes": "Monthly deposit"
            }
        }


class BankrollEventUpdate(BaseModel):
    """Schema for updating a bankroll event"""
    amount: Optional[Decimal] = Field(None, decimal_places=2, description="Transaction amount")
    event_type: Optional[str] = Field(None, description="Event type")
    notes: Optional[str] = Field(None, description="Event notes")

    class Config:
        json_schema_extra = {
            "example": {
                "amount": "600.00",
                "event_type": "deposit",
                "notes": "Updated deposit"
            }
        }


class BankrollEventResponse(BaseModel):
    """Schema for bankroll event response"""
    id: int
    user_id: int
    amount: Decimal
    event_type: str
    occurred_at: datetime
    notes: Optional[str]

    class Config:
        from_attributes = True
        json_schema_extra = {
            "example": {
                "id": 1,
                "user_id": 1,
                "amount": "500.00",
                "event_type": "deposit",
                "occurred_at": "2026-04-08T12:00:00+00:00",
                "notes": "Monthly deposit"
            }
        }

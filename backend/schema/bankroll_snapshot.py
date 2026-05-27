from pydantic import BaseModel, Field, condecimal
from datetime import datetime

# Decimal type constrained to 2 decimal places
Money2 = condecimal(decimal_places=2)


class BankrollSnapshotCreate(BaseModel):
    """Schema for creating a bankroll snapshot"""
    user_id: int = Field(..., description="User ID")
    amount: Money2 = Field(..., description="Bankroll amount")

    class Config:
        json_schema_extra = {
            "example": {
                "user_id": 1,
                "amount": "2500.00"
            }
        }


class BankrollSnapshotUpdate(BaseModel):
    """Schema for updating a bankroll snapshot"""
    amount: Money2 = Field(..., description="Bankroll amount")

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
    amount: Money2
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

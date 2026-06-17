#Überarbeitet von Andreas Haas
from pydantic import BaseModel, Field
from datetime import datetime, date as Date  # ← neu
from decimal import Decimal
from typing import Optional

class DepositCreate(BaseModel):
    user_id: int = Field(..., description="User ID")
    amount: Decimal = Field(..., gt=0, description="Deposit amount")
    date: Optional[Date] = Field(None, description="Deposit date (defaults to today)")  # ← neu
    notes: Optional[str] = Field(None, description="Optional notes")

class DepositUpdate(BaseModel):
    amount: Optional[Decimal] = Field(None, gt=0)
    date: Optional[Date] = Field(None)  # ← neu
    notes: Optional[str] = Field(None)

class DepositResponse(BaseModel):
    id: int
    user_id: int
    amount: Decimal
    date: datetime
    notes: Optional[str]

    class Config:
        from_attributes = True
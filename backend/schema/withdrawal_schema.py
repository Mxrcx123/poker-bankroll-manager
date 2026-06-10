# BUG FIX: user_id fehlte im Create-Schema → Withdrawals wurden anonym gespeichert
# ÄNDERUNG: user_id hinzugefügt, WithdrawalResponse neu erstellt
from pydantic import BaseModel, Field
from datetime import datetime
from decimal import Decimal
from typing import Optional


class WithdrawalCreate(BaseModel):
    user_id: int = Field(..., description="User ID")  # NEU: war komplett vergessen
    amount: float = Field(..., gt=0, description="Auszahlungsbetrag (muss > 0 sein)")
    currency: str
    date: datetime
    note: Optional[str] = None


class WithdrawalUpdate(BaseModel):
    amount: Optional[float] = Field(None, gt=0)
    note: Optional[str] = None


class WithdrawalResponse(BaseModel):  # NEU: fehlte komplett
    id: int
    user_id: int
    amount: Decimal
    currency: Optional[str]
    date: datetime
    note: Optional[str]

    class Config:
        from_attributes = True

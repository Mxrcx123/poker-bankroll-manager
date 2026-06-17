from pydantic import BaseModel, Field, condecimal
from typing import Optional
from decimal import Decimal

class CashSessionCreate(BaseModel):
    session_id: int = Field(..., description="Session ID")
    buy_in: Decimal = Field(..., description="Buy-in amount")
    cash_out: Optional[Decimal] = Field(None, description="Cash-out amount")

    class Config:
        json_schema_extra = {"example": {"session_id": 1, "buy_in": "200.00", "cash_out": "450.00"}}

class CashSessionUpdate(BaseModel):
    buy_in: Optional[Decimal] = Field(None, description="Buy-in amount")
    cash_out: Optional[Decimal] = Field(None, description="Cash-out amount")

    class Config:
        json_schema_extra = {"example": {"buy_in": "200.00", "cash_out": "500.00"}}

class CashSessionResponse(BaseModel):
    id: int
    session_id: int
    buy_in: Optional[Decimal]
    cash_out: Optional[Decimal]

    class Config:
        from_attributes = True
        json_schema_extra = {"example": {"id": 1, "session_id": 1, "buy_in": "200.00", "cash_out": "450.00"}}
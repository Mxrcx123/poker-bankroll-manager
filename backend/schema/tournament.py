from pydantic import BaseModel, Field
from typing import Optional
from decimal import Decimal


class TournamentCreate(BaseModel):
    """Schema for creating a tournament"""
    session_id: int = Field(..., description="Session ID")
    buy_in: Decimal = Field(..., decimal_places=2, description="Tournament buy-in")
    fee: Optional[Decimal] = Field(None, decimal_places=2, description="Tournament fee")
    rebuys: int = Field(default=0, description="Number of rebuys")
    rebuy_cost: Optional[Decimal] = Field(None, decimal_places=2, description="Cost per rebuy")
    add_ons: int = Field(default=0, description="Number of add-ons")
    add_on_cost: Optional[Decimal] = Field(None, decimal_places=2, description="Cost per add-on")
    winnings: Decimal = Field(default=0, decimal_places=2, description="Total winnings")
    finish_position: Optional[int] = Field(None, description="Finishing position")

    class Config:
        json_schema_extra = {
            "example": {
                "session_id": 2,
                "buy_in": "100.00",
                "fee": "10.00",
                "rebuys": 1,
                "rebuy_cost": "100.00",
                "add_ons": 0,
                "add_on_cost": None,
                "winnings": "250.00",
                "finish_position": 5
            }
        }


class TournamentUpdate(BaseModel):
    """Schema for updating a tournament"""
    buy_in: Optional[Decimal] = Field(None, decimal_places=2, description="Tournament buy-in")
    fee: Optional[Decimal] = Field(None, decimal_places=2, description="Tournament fee")
    rebuys: Optional[int] = Field(None, description="Number of rebuys")
    rebuy_cost: Optional[Decimal] = Field(None, decimal_places=2, description="Cost per rebuy")
    add_ons: Optional[int] = Field(None, description="Number of add-ons")
    add_on_cost: Optional[Decimal] = Field(None, decimal_places=2, description="Cost per add-on")
    winnings: Optional[Decimal] = Field(None, decimal_places=2, description="Total winnings")
    finish_position: Optional[int] = Field(None, description="Finishing position")

    class Config:
        json_schema_extra = {
            "example": {
                "buy_in": "100.00",
                "fee": "10.00",
                "rebuys": 1,
                "rebuy_cost": "100.00",
                "add_ons": 0,
                "add_on_cost": None,
                "winnings": "300.00",
                "finish_position": 3
            }
        }


class TournamentResponse(BaseModel):
    """Schema for tournament response"""
    id: int
    session_id: int
    buy_in: Decimal
    fee: Optional[Decimal]
    rebuys: int
    rebuy_cost: Optional[Decimal]
    add_ons: int
    add_on_cost: Optional[Decimal]
    winnings: Decimal
    finish_position: Optional[int]

    class Config:
        from_attributes = True
        json_schema_extra = {
            "example": {
                "id": 1,
                "session_id": 2,
                "buy_in": "100.00",
                "fee": "10.00",
                "rebuys": 1,
                "rebuy_cost": "100.00",
                "add_ons": 0,
                "add_on_cost": None,
                "winnings": "250.00",
                "finish_position": 5
            }
        }

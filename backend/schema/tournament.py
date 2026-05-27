from pydantic import BaseModel, Field, condecimal
from typing import Optional

# Decimal type constrained to 2 decimal places
Money2 = condecimal(decimal_places=2)

# User Story 4: Edit Bankroll Event
# Zugewiesene Person: Katharina Almer
# Autor des Codes: Stafan Derler 
# Anmerkungen: Die Funktionen waren bereits vorhanden, ich habe nur kleinere Anpassungen gemacht (siehe meine letzten Commits)

class TournamentCreate(BaseModel):
    """Schema for creating a tournament"""
    session_id: int = Field(..., description="Session ID")
    buy_in: Money2 = Field(..., description="Tournament buy-in")
    fee: Optional[Money2] = Field(None, description="Tournament fee")
    rebuys: int = Field(default=0, description="Number of rebuys")
    rebuy_cost: Optional[Money2] = Field(None, description="Cost per rebuy")
    add_ons: int = Field(default=0, description="Number of add-ons")
    add_on_cost: Optional[Money2] = Field(None, description="Cost per add-on")
    winnings: Money2 = Field(default=0, description="Total winnings")
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

# User Story 4: Edit Bankroll Event
# Zugewiesene Person: Katharina Almer
# Autor des Codes: Stafan Derler 
# Anmerkungen: Die Funktionen waren bereits vorhanden, ich habe nur kleinere Anpassungen gemacht (siehe meine letzten Commits)

class TournamentUpdate(BaseModel):
    """Schema for updating a tournament"""
    buy_in: Optional[Money2] = Field(None, description="Tournament buy-in")
    fee: Optional[Money2] = Field(None, description="Tournament fee")
    rebuys: Optional[int] = Field(None, description="Number of rebuys")
    rebuy_cost: Optional[Money2] = Field(None, description="Cost per rebuy")
    add_ons: Optional[int] = Field(None, description="Number of add-ons")
    add_on_cost: Optional[Money2] = Field(None, description="Cost per add-on")
    winnings: Optional[Money2] = Field(None, description="Total winnings")
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

# User Story 4: Edit Bankroll Event
# Zugewiesene Person: Katharina Almer
# Autor des Codes: Stafan Derler 
# Anmerkungen: Die Funktionen waren bereits vorhanden, ich habe nur kleinere Anpassungen gemacht (siehe meine letzten Commits)

class TournamentResponse(BaseModel):
    """Schema for tournament response"""
    id: int
    session_id: int
    buy_in: Money2
    fee: Optional[Money2]
    rebuys: int
    rebuy_cost: Optional[Money2]
    add_ons: int
    add_on_cost: Optional[Money2]
    winnings: Money2
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

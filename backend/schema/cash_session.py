from pydantic import BaseModel, Field, condecimal
from typing import Optional

# Decimal type constrained to 2 decimal places
Money2 = condecimal(decimal_places=2)

# User Story 4: Edit Bankroll Event
# Zugewiesene Person: Katharina Almer
# Autor des Codes: Stafan Derler 
# Anmerkungen: Die Funktionen waren bereits vorhanden, ich habe nur kleinere Anpassungen gemacht (siehe meine letzten Commits)

class CashSessionCreate(BaseModel):
    """Schema for creating a cash session"""
    session_id: int = Field(..., description="Session ID")
    buy_in: Money2 = Field(..., description="Buy-in amount")
    cash_out: Optional[Money2] = Field(None, description="Cash-out amount")

    class Config:
        json_schema_extra = {
            "example": {
                "session_id": 1,
                "buy_in": "200.00",
                "cash_out": "450.00"
            }
        }

# User Story 4: Edit Bankroll Event
# Zugewiesene Person: Katharina Almer
# Autor des Codes: Stafan Derler 
# Anmerkungen: Die Funktionen waren bereits vorhanden, ich habe nur kleinere Anpassungen gemacht (siehe meine letzten Commits)

class CashSessionUpdate(BaseModel):
    """Schema for updating a cash session"""
    buy_in: Optional[Money2] = Field(None, description="Buy-in amount")
    cash_out: Optional[Money2] = Field(None, description="Cash-out amount")

    class Config:
        json_schema_extra = {
            "example": {
                "buy_in": "200.00",
                "cash_out": "500.00"
            }
        }

# User Story 4: Edit Bankroll Event
# Zugewiesene Person: Katharina Almer
# Autor des Codes: Stafan Derler 
# Anmerkungen: Die Funktionen waren bereits vorhanden, ich habe nur kleinere Anpassungen gemacht (siehe meine letzten Commits)

class CashSessionResponse(BaseModel):
    """Schema for cash session response"""
    id: int
    session_id: int
    buy_in: Money2
    cash_out: Optional[Money2]

    class Config:
        from_attributes = True
        json_schema_extra = {
            "example": {
                "id": 1,
                "session_id": 1,
                "buy_in": "200.00",
                "cash_out": "450.00"
            }
        }

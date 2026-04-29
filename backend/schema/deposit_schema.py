from pydantic import BaseModel, Field

class DepositCreate(BaseModel):
    amount: float = Field(..., gt=0)

class DepositResponse(BaseModel):
    id: int
    amount: float
    bankroll: float

    class Config:
        from_attributes = True
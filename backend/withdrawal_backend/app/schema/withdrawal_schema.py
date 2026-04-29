from pydantic import BaseModel
from datetime import datetime

class WithdrawalCreate(BaseModel):
    amount: float
    currency: str
    date: datetime
    note: str | None = None


class WithdrawalUpdate(BaseModel):
    amount: float | None = None
    note: str | None = None
from pydantic import BaseModel
from uuid import UUID
from datetime import datetime

class Withdrawal(BaseModel):
    id: UUID
    amount: float
    currency: str
    date: datetime
    note: str | None = None
    created_at: datetime
    updated_at: datetime
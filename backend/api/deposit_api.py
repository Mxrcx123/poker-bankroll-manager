# Story 1
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from model.base import get_db
from schema.deposit_schema import DepositCreate, DepositResponse
from crud.deposit_crud import create_deposit

router = APIRouter(prefix="/deposits", tags=["Deposits"])


@router.post("/", response_model=DepositResponse)
def create_deposit_endpoint(payload: DepositCreate, db: Session = Depends(get_db)):
    deposit, bankroll = create_deposit(db, payload.amount)
    return DepositResponse(
        id=deposit.id,
        amount=float(deposit.amount),
        bankroll=float(bankroll.amount),
    )
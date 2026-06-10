# Überarbeitet von Andreas Haas
# ÄNDERUNG: response_model=WithdrawalResponse hinzugefügt (war komplett fehlend)
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from schema.withdrawal_schema import WithdrawalCreate, WithdrawalUpdate, WithdrawalResponse
from services import withdrawal_service
from model.base import get_db

router = APIRouter(prefix="/withdrawals", tags=["Withdrawals"])


@router.post("/", response_model=WithdrawalResponse)
def create_withdrawal(data: WithdrawalCreate, db: Session = Depends(get_db)):
    try:
        return withdrawal_service.create(db, data)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/", response_model=list[WithdrawalResponse])
def get_all(db: Session = Depends(get_db)):
    return withdrawal_service.get_all(db)


@router.get("/{w_id}", response_model=WithdrawalResponse)
def get_one(w_id: int, db: Session = Depends(get_db)):
    withdrawal = withdrawal_service.get_one(db, w_id)
    if not withdrawal:
        raise HTTPException(status_code=404, detail="Withdrawal not found")
    return withdrawal


@router.put("/{w_id}", response_model=WithdrawalResponse)
def update(w_id: int, data: WithdrawalUpdate, db: Session = Depends(get_db)):
    withdrawal = withdrawal_service.update(db, w_id, data)
    if not withdrawal:
        raise HTTPException(status_code=404, detail="Withdrawal not found")
    return withdrawal


@router.delete("/{w_id}")
def delete(w_id: int, db: Session = Depends(get_db)):
    withdrawal = withdrawal_service.delete(db, w_id)
    if not withdrawal:
        raise HTTPException(status_code=404, detail="Withdrawal not found")
    return {"message": "Deleted successfully"}

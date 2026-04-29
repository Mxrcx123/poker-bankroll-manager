from fastapi import APIRouter, HTTPException
from app.schema.withdrawal_schema import WithdrawalCreate, WithdrawalUpdate
from app.services import withdrawal_service

router = APIRouter(prefix="/withdrawals", tags=["Withdrawals"])


@router.post("/")
def create_withdrawal(data: WithdrawalCreate):
    try:
        return withdrawal_service.create(data)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/")
def get_all():
    return withdrawal_service.get_all()


@router.get("/{w_id}")
def get_one(w_id: str):
    withdrawal = withdrawal_service.get_one(w_id)
    if not withdrawal:
        raise HTTPException(status_code=404, detail="Withdrawal not found")
    return withdrawal


@router.put("/{w_id}")
def update(w_id: str, data: WithdrawalUpdate):
    withdrawal = withdrawal_service.update(w_id, data)
    if not withdrawal:
        raise HTTPException(status_code=404, detail="Withdrawal not found")
    return withdrawal


@router.delete("/{w_id}")
def delete(w_id: str):
    withdrawal = withdrawal_service.delete(w_id)
    if not withdrawal:
        raise HTTPException(status_code=404, detail="Withdrawal not found")
    return {"message": "Deleted successfully"}
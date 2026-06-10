#Überarbeitet von Andreas Haas
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from model.base import get_db
from crud.deposit_crud import DepositCrud
from schema.deposit_schema import DepositCreate, DepositUpdate, DepositResponse

router = APIRouter(prefix="/deposits", tags=["Deposits"])

@router.post("/", response_model=DepositResponse)
async def create_deposit(deposit: DepositCreate, db_session: Session = Depends(get_db)):
    try:
        return DepositCrud.create_deposit(db_session, deposit)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/{deposit_id}", response_model=DepositResponse)
async def get_deposit(deposit_id: int, db_session: Session = Depends(get_db)):
    deposit = DepositCrud.get_deposit(db_session, deposit_id)
    if not deposit:
        raise HTTPException(status_code=404, detail="Deposit not found")
    return deposit

@router.get("/user/{user_id}", response_model=list[DepositResponse])
async def get_deposits_by_user(user_id: int, db_session: Session = Depends(get_db)):
    return DepositCrud.get_deposits_by_user(db_session, user_id)

@router.put("/{deposit_id}", response_model=DepositResponse)
async def update_deposit(deposit_id: int, deposit: DepositUpdate, db_session: Session = Depends(get_db)):
    updated_deposit = DepositCrud.update_deposit(db_session, deposit_id, deposit)
    if not updated_deposit:
        raise HTTPException(status_code=404, detail="Deposit not found")
    return updated_deposit

@router.delete("/{deposit_id}")
async def delete_deposit(deposit_id: int, db_session: Session = Depends(get_db)):
    deleted = DepositCrud.delete_deposit(db_session, deposit_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Deposit not found")
    return {"message": "Deposit successfully deleted"}

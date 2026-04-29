from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session


from schema.deposit_schema import DepositCreate, DepositResponse

router = APIRouter(prefix="/deposits", tags=["deposits"])


@router.post("/", response_model=DepositResponse)
def create_deposit_endpoint(payload: DepositCreate, db: Session = Depends(get_db)):
    return add_deposit(db, payload.amount)
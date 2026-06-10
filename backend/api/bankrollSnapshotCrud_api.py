from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from model.base import get_db
from crud.bankrollSnapshotCrud import BankrollSnapshotCrud

router = APIRouter()

@router.post("/bankroll-snapshot/{user_id}/{amount}")
# This endpoint creates a new bankroll snapshot in the database.
async def create_bankroll_snapshot(user_id: int, amount: float, db_session: Session = Depends(get_db)):
    try:
        BankrollSnapshotCrud.create_bankroll_snapshot(db_session, user_id, amount)
        return {"message": "Bankroll snapshot created successfully"}
    except Exception as e:
        return {"error": str(e)}

@router.get("/bankroll-snapshot/{snapshot_id}")
# This endpoint returns a bankroll snapshot based on its id.
async def get_bankroll_snapshot_by_id(snapshot_id: int, db_session: Session = Depends(get_db)):
    try:
        snapshot = BankrollSnapshotCrud.get_bankroll_snapshot_by_id(db_session, snapshot_id)
        return {
            "message": "successfully got bankroll snapshot",
            "id": snapshot.id,
            "user_id": snapshot.user_id,
            "amount": snapshot.amount,
            "recorded_at": snapshot.recorded_at
        }
    except Exception as e:
        return {"error": str(e)}

@router.get("/bankroll-snapshot/user/{user_id}")
# This endpoint returns all bankroll snapshots for a user.
async def get_bankroll_snapshots_by_user_id(user_id: int, db_session: Session = Depends(get_db)):
    try:
        snapshots = BankrollSnapshotCrud.get_bankroll_snapshots_by_user_id(db_session, user_id)
        return {
            "message": "successfully got bankroll snapshots",
            "snapshots": [{"id": s.id, "user_id": s.user_id, "amount": s.amount, "recorded_at": s.recorded_at} for s in snapshots]
        }
    except Exception as e:
        return {"error": str(e)}

@router.get("/bankroll-snapshot/latest/{user_id}")
# This endpoint returns the latest bankroll snapshot for a user.
async def get_latest_bankroll_snapshot_by_user_id(user_id: int, db_session: Session = Depends(get_db)):
    try:
        snapshot = BankrollSnapshotCrud.get_latest_bankroll_snapshot_by_user_id(db_session, user_id)
        return {
            "message": "successfully got latest bankroll snapshot",
            "id": snapshot.id,
            "user_id": snapshot.user_id,
            "amount": snapshot.amount,
            "recorded_at": snapshot.recorded_at
        }
    except Exception as e:
        return {"error": str(e)}

@router.put("/bankroll-snapshot/{snapshot_id}")
# This endpoint updates a bankroll snapshot based on its id.
async def update_bankroll_snapshot(snapshot_id: int, amount: float = None, db_session: Session = Depends(get_db)):
    try:
        BankrollSnapshotCrud.update_bankroll_snapshot(db_session, snapshot_id, amount)
        return {"message": "successfully updated bankroll snapshot"}
    except Exception as e:
        return {"error": str(e)}

@router.delete("/bankroll-snapshot/delete/{snapshot_id}")
# This endpoint deletes a bankroll snapshot based on its id.
async def delete_bankroll_snapshot(snapshot_id: int, db_session: Session = Depends(get_db)):
    try:
        BankrollSnapshotCrud.delete_bankroll_snapshot(db_session, snapshot_id)
        return {"message": "successfully deleted bankroll snapshot"}
    except Exception as e:
        return {"error": str(e)}
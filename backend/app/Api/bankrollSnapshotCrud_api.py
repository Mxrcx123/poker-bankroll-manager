from fastapi import FastAPI
from sqlalchemy.orm import Session
from backend.app.crud.bankrollSnapshotCrud import BankrollSnapshotCrud

app = FastAPI()

@app.post("/bankroll-snapshot/{db_session}/{user_id}/{amount}")
# This endpoint creates a new bankroll snapshot in the database.
async def create_bankroll_snapshot(db_session: Session, user_id: int, amount: float):
    try:
        BankrollSnapshotCrud.create_bankroll_snapshot(db_session, user_id, amount)
        return {"message": "Bankroll snapshot created successfully"}
    except Exception as e:
        return {"error": str(e)}

@app.get("/bankroll-snapshot/{db_session}/{snapshot_id}")
# This endpoint returns a bankroll snapshot based on its id.
async def get_bankroll_snapshot_by_id(db_session: Session, snapshot_id: int):
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

@app.get("/bankroll-snapshot/user/{db_session}/{user_id}")
# This endpoint returns all bankroll snapshots for a user.
async def get_bankroll_snapshots_by_user_id(db_session: Session, user_id: int):
    try:
        snapshots = BankrollSnapshotCrud.get_bankroll_snapshots_by_user_id(db_session, user_id)
        return {
            "message": "successfully got bankroll snapshots",
            "snapshots": [{"id": s.id, "user_id": s.user_id, "amount": s.amount, "recorded_at": s.recorded_at} for s in snapshots]
        }
    except Exception as e:
        return {"error": str(e)}

@app.get("/bankroll-snapshot/latest/{db_session}/{user_id}")
# This endpoint returns the latest bankroll snapshot for a user.
async def get_latest_bankroll_snapshot_by_user_id(db_session: Session, user_id: int):
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

@app.put("/bankroll-snapshot/{db_session}/{snapshot_id}")
# This endpoint updates a bankroll snapshot based on its id.
async def update_bankroll_snapshot(db_session: Session, snapshot_id: int, amount: float = None):
    try:
        BankrollSnapshotCrud.update_bankroll_snapshot(db_session, snapshot_id, amount)
        return {"message": "successfully updated bankroll snapshot"}
    except Exception as e:
        return {"error": str(e)}

@app.delete("/bankroll-snapshot/delete/{db_session}/{snapshot_id}")
# This endpoint deletes a bankroll snapshot based on its id.
async def delete_bankroll_snapshot(db_session: Session, snapshot_id: int):
    try:
        BankrollSnapshotCrud.delete_bankroll_snapshot(db_session, snapshot_id)
        return {"message": "successfully deleted bankroll snapshot"}
    except Exception as e:
        return {"error": str(e)}
from fastapi import FastAPI
from sqlalchemy.orm import Session
from backend.app.crud.bankrollEventCrud import BankrollEventCrud

app = FastAPI()

@app.post("/bankroll-event/{db_session}/{user_id}/{amount}/{event_type}")
# This endpoint creates a new bankroll event in the database.
async def create_bankroll_event(db_session: Session, user_id: int, amount: float, event_type: str, notes: str = None):
    try:
        BankrollEventCrud.create_bankroll_event(db_session, user_id, amount, event_type, notes)
        return {"message": "Bankroll event created successfully"}
    except Exception as e:
        return {"error": str(e)}

@app.get("/bankroll-event/{db_session}/{event_id}")
# This endpoint returns a bankroll event based on its id.
async def get_bankroll_event_by_id(db_session: Session, event_id: int):
    try:
        event = BankrollEventCrud.get_bankroll_event_by_id(db_session, event_id)
        return {
            "message": "successfully got bankroll event",
            "id": event.id,
            "user_id": event.user_id,
            "amount": event.amount,
            "event_type": event.event_type,
            "notes": event.notes,
            "created_at": event.created_at
        }
    except Exception as e:
        return {"error": str(e)}

@app.get("/bankroll-event/user/{db_session}/{user_id}")
# This endpoint returns all bankroll events for a user.
async def get_bankroll_events_by_user_id(db_session: Session, user_id: int):
    try:
        events = BankrollEventCrud.get_bankroll_events_by_user_id(db_session, user_id)
        return {
            "message": "successfully got bankroll events",
            "events": [{"id": e.id, "user_id": e.user_id, "amount": e.amount, "event_type": e.event_type, "notes": e.notes, "created_at": e.created_at} for e in events]
        }
    except Exception as e:
        return {"error": str(e)}

@app.get("/bankroll-event/type/{db_session}/{event_type}")
# This endpoint returns all bankroll events of a specific type.
async def get_bankroll_events_by_type(db_session: Session, event_type: str):
    try:
        events = BankrollEventCrud.get_bankroll_events_by_type(db_session, event_type)
        return {
            "message": "successfully got bankroll events",
            "events": [{"id": e.id, "user_id": e.user_id, "amount": e.amount, "event_type": e.event_type, "notes": e.notes, "created_at": e.created_at} for e in events]
        }
    except Exception as e:
        return {"error": str(e)}

@app.put("/bankroll-event/{db_session}/{event_id}")
# This endpoint updates a bankroll event based on its id.
async def update_bankroll_event(db_session: Session, event_id: int, amount: float = None, event_type: str = None, notes: str = None):
    try:
        BankrollEventCrud.update_bankroll_event(db_session, event_id, amount, event_type, notes)
        return {"message": "successfully updated bankroll event"}
    except Exception as e:
        return {"error": str(e)}

@app.delete("/bankroll-event/delete/{db_session}/{event_id}")
# This endpoint deletes a bankroll event based on its id.
async def delete_bankroll_event(db_session: Session, event_id: int):
    try:
        BankrollEventCrud.delete_bankroll_event(db_session, event_id)
        return {"message": "successfully deleted bankroll event"}
    except Exception as e:
        return {"error": str(e)}
# BUG FIX: event.created_at → event.occurred_at (Feld heißt im Model occurred_at!)
#           Das hätte bei jedem GET-Aufruf einen AttributeError geworfen.
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from model.base import get_db
from crud.bankrollEventCrud import BankrollEventCrud

router = APIRouter()


@router.post("/bankroll-event/{user_id}/{amount}/{event_type}")
async def create_bankroll_event(
    user_id: int, amount: float, event_type: str,
    notes: str = None, db_session: Session = Depends(get_db)
):
    try:
        BankrollEventCrud.create_bankroll_event(db_session, user_id, amount, event_type, notes)
        return {"message": "Bankroll event created successfully"}
    except Exception as e:
        return {"error": str(e)}


@router.get("/bankroll-event/{event_id}")
async def get_bankroll_event_by_id(event_id: int, db_session: Session = Depends(get_db)):
    try:
        event = BankrollEventCrud.get_bankroll_event_by_id(db_session, event_id)
        return {
            "message": "successfully got bankroll event",
            "id": event.id,
            "user_id": event.user_id,
            "amount": event.amount,
            "event_type": event.event_type,
            "notes": event.notes,
            "occurred_at": event.occurred_at  # FIX: war event.created_at → crash
        }
    except Exception as e:
        return {"error": str(e)}


@router.get("/bankroll-event/user/{user_id}")
async def get_bankroll_events_by_user_id(user_id: int, db_session: Session = Depends(get_db)):
    try:
        events = BankrollEventCrud.get_bankroll_events_by_user_id(db_session, user_id)
        return {
            "message": "successfully got bankroll events",
            "events": [
                {
                    "id": e.id,
                    "user_id": e.user_id,
                    "amount": e.amount,
                    "event_type": e.event_type,
                    "notes": e.notes,
                    "occurred_at": e.occurred_at  # FIX: war e.created_at → crash
                }
                for e in events
            ]
        }
    except Exception as e:
        return {"error": str(e)}


@router.get("/bankroll-event/type/{event_type}")
async def get_bankroll_events_by_type(event_type: str, db_session: Session = Depends(get_db)):
    try:
        events = BankrollEventCrud.get_bankroll_events_by_type(db_session, event_type)
        return {
            "message": "successfully got bankroll events",
            "events": [
                {
                    "id": e.id,
                    "user_id": e.user_id,
                    "amount": e.amount,
                    "event_type": e.event_type,
                    "notes": e.notes,
                    "occurred_at": e.occurred_at  # FIX: war e.created_at → crash
                }
                for e in events
            ]
        }
    except Exception as e:
        return {"error": str(e)}


@router.put("/bankroll-event/{event_id}")
async def update_bankroll_event(
    event_id: int, amount: float = None, event_type: str = None,
    notes: str = None, db_session: Session = Depends(get_db)
):
    try:
        BankrollEventCrud.update_bankroll_event(db_session, event_id, amount, event_type, notes)
        return {"message": "successfully updated bankroll event"}
    except Exception as e:
        return {"error": str(e)}


@router.delete("/bankroll-event/delete/{event_id}")
async def delete_bankroll_event(event_id: int, db_session: Session = Depends(get_db)):
    try:
        BankrollEventCrud.delete_bankroll_event(db_session, event_id)
        return {"message": "successfully deleted bankroll event"}
    except Exception as e:
        return {"error": str(e)}

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from model.base import get_db
from crud.cashSessionCrud import CashSessionCrud

router = APIRouter()

@router.post("/cash-session/{session_id}/{buy_in}")
# This endpoint creates a new cash session in the database.
async def create_cash_session(session_id: int, buy_in: float, cash_out: float = None, db_session: Session = Depends(get_db)):
    try:
        CashSessionCrud.create_cash_session(db_session, session_id, buy_in, cash_out)
        return {"message": "Cash session created successfully"}
    except Exception as e:
        return {"error": str(e)}

@router.get("/cash-session/{cash_session_id}")
# This endpoint returns a cash session based on its id.
async def get_cash_session_by_id(cash_session_id: int, db_session: Session = Depends(get_db)):
    try:
        cash_session = CashSessionCrud.get_cash_session_by_id(db_session, cash_session_id)
        return {
            "message": "successfully got cash session",
            "id": cash_session.id,
            "session_id": cash_session.session_id,
            "buy_in": cash_session.buy_in,
            "cash_out": cash_session.cash_out,
            # // Story 12
            "profit_loss": cash_session.profit_loss
        }
    except Exception as e:
        return {"error": str(e)}

@router.get("/cash-session/session/{session_id}")
# This endpoint returns a cash session based on its session id.
async def get_cash_session_by_session_id(session_id: int, db_session: Session = Depends(get_db)):
    try:
        cash_session = CashSessionCrud.get_cash_session_by_session_id(db_session, session_id)
        return {
            "message": "successfully got cash session",
            "id": cash_session.id,
            "session_id": cash_session.session_id,
            "buy_in": cash_session.buy_in,
            "cash_out": cash_session.cash_out,
            # // Story 12
            "profit_loss": cash_session.profit_loss
        }
    except Exception as e:
        return {"error": str(e)}

@router.put("/cash-session/{cash_session_id}")
# This endpoint updates a cash session based on its id.
async def update_cash_session(cash_session_id: int, buy_in: float = None, cash_out: float = None, db_session: Session = Depends(get_db)):
    try:
        CashSessionCrud.update_cash_session(db_session, cash_session_id, buy_in, cash_out)
        return {"message": "successfully updated cash session"}
    except Exception as e:
        return {"error": str(e)}

@router.put("/cash-session/session/{session_id}/cash-out/{cash_out}")
# This endpoint records the cash-out value for an existing cash game session.
# // Story 11
async def record_cash_out(session_id: int, cash_out: float, db_session: Session = Depends(get_db)):
    try:
        cash_session = CashSessionCrud.update_cash_out_by_session_id(db_session, session_id, cash_out)
        if cash_session is None:
            return {"error": "Cash session not found"}
        return {
            "message": "successfully recorded cash-out",
            "id": cash_session.id,
            "session_id": cash_session.session_id,
            "buy_in": cash_session.buy_in,
            "cash_out": cash_session.cash_out,
            # // Story 12
            "profit_loss": cash_session.profit_loss
        }
    except Exception as e:
        return {"error": str(e)}

@router.delete("/cash-session/delete/{cash_session_id}")
# This endpoint deletes a cash session based on its id.
async def delete_cash_session(cash_session_id: int, db_session: Session = Depends(get_db)):
    try:
        CashSessionCrud.delete_cash_session(db_session, cash_session_id)
        return {"message": "successfully deleted cash session"}
    except Exception as e:
        return {"error": str(e)}

from fastapi import FastAPI
from sqlalchemy.orm import Session
from backend.app.crud.cashSessionCrud import CashSessionCrud

app = FastAPI()

@app.post("/cash-session/{db_session}/{session_id}/{buy_in}")
# This endpoint creates a new cash session in the database.
async def create_cash_session(db_session: Session, session_id: int, buy_in: float, cash_out: float = None):
    try:
        CashSessionCrud.create_cash_session(db_session, session_id, buy_in, cash_out)
        return {"message": "Cash session created successfully"}
    except Exception as e:
        return {"error": str(e)}

@app.get("/cash-session/{db_session}/{cash_session_id}")
# This endpoint returns a cash session based on its id.
async def get_cash_session_by_id(db_session: Session, cash_session_id: int):
    try:
        cash_session = CashSessionCrud.get_cash_session_by_id(db_session, cash_session_id)
        return {
            "message": "successfully got cash session",
            "id": cash_session.id,
            "session_id": cash_session.session_id,
            "buy_in": cash_session.buy_in,
            "cash_out": cash_session.cash_out
        }
    except Exception as e:
        return {"error": str(e)}

@app.get("/cash-session/session/{db_session}/{session_id}")
# This endpoint returns a cash session based on its session id.
async def get_cash_session_by_session_id(db_session: Session, session_id: int):
    try:
        cash_session = CashSessionCrud.get_cash_session_by_session_id(db_session, session_id)
        return {
            "message": "successfully got cash session",
            "id": cash_session.id,
            "session_id": cash_session.session_id,
            "buy_in": cash_session.buy_in,
            "cash_out": cash_session.cash_out
        }
    except Exception as e:
        return {"error": str(e)}

@app.put("/cash-session/{db_session}/{cash_session_id}")
# This endpoint updates a cash session based on its id.
async def update_cash_session(db_session: Session, cash_session_id: int, buy_in: float = None, cash_out: float = None):
    try:
        CashSessionCrud.update_cash_session(db_session, cash_session_id, buy_in, cash_out)
        return {"message": "successfully updated cash session"}
    except Exception as e:
        return {"error": str(e)}

@app.delete("/cash-session/delete/{db_session}/{cash_session_id}")
# This endpoint deletes a cash session based on its id.
async def delete_cash_session(db_session: Session, cash_session_id: int):
    try:
        CashSessionCrud.delete_cash_session(db_session, cash_session_id)
        return {"message": "successfully deleted cash session"}
    except Exception as e:
        return {"error": str(e)}
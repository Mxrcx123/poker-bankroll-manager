from sqlalchemy.orm import Session
from ..model.cash_session import CashSession


class CashSessionCrud():
    @staticmethod
    def create_cash_session(db: Session, session_id: int, buy_in: float, cash_out: float = None):
        new_cash_session = CashSession(
            session_id=session_id,
            buy_in=buy_in,
            cash_out=cash_out
        )
        db.add(new_cash_session)
        db.commit()
        db.refresh(new_cash_session)
        return new_cash_session

    @staticmethod
    def get_cash_session_by_id(db: Session, cash_session_id: int):
        return db.query(CashSession).filter(CashSession.id == cash_session_id).first()

    @staticmethod
    def get_cash_session_by_session_id(db: Session, session_id: int):
        return db.query(CashSession).filter(CashSession.session_id == session_id).first()

    @staticmethod
    def update_cash_session(db: Session, cash_session_id: int, buy_in: float = None, cash_out: float = None):
        cash_session = db.query(CashSession).filter(CashSession.id == cash_session_id).first()
        if not cash_session:
            return None
        if buy_in is not None:
            cash_session.buy_in = buy_in
        if cash_out is not None:
            cash_session.cash_out = cash_out
        db.commit()
        db.refresh(cash_session)
        return cash_session

    @staticmethod
    def delete_cash_session(db: Session, cash_session_id: int):
        cash_session = db.query(CashSession).filter(CashSession.id == cash_session_id).first()
        if cash_session:
            db.delete(cash_session)
            db.commit()
        return cash_session

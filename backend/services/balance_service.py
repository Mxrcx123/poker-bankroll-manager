# NEU: Zentraler Service für Balance-Berechnung
# Wird von deposit_crud und withdrawal_crud verwendet.
from sqlalchemy import func
from sqlalchemy.orm import Session
from model.bankroll_events import BankrollEvent
from model.user import User


def update_balance_no_commit(db: Session, user_id: int) -> float:
    """
    Berechnet die Balance aus allen BankrollEvents des Users (inkl. pending flush)
    und schreibt sie nach user.balance — OHNE zu committen.

    SQLAlchemy flusht automatisch vor der SUM-Query, also werden auch noch
    nicht committete Events (z.B. gerade erstellte Deposits/Withdrawals)
    bereits mitgezählt. Der Caller ist für den Commit zuständig.
    """
    total = db.query(func.sum(BankrollEvent.amount)).filter(
        BankrollEvent.user_id == user_id
    ).scalar()

    balance = float(total or 0)

    user = db.query(User).filter(User.id == user_id).first()
    if user:
        user.balance = balance

    return balance


def recalculate_balance(db: Session, user_id: int) -> float:
    """
    Wie update_balance_no_commit, aber mit eigenem Commit.
    Für standalone-Aufrufe wenn man sicher gehen will, dass die Balance
    korrekt ist (z.B. nach Datenimport oder manuellen DB-Änderungen).
    """
    balance = update_balance_no_commit(db, user_id)
    db.commit()
    return balance


def get_current_bankroll(db: Session, user_id: int) -> float:
    """
    Gibt die gespeicherte Balance des Users zurück (aus user.balance).
    Schnell, keine Aggregation nötig.
    """
    user = db.query(User).filter(User.id == user_id).first()
    return float(user.balance or 0) if user else 0.0

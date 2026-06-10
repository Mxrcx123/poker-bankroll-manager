# Überarbeitet von Andreas Haas
# BUG FIX: get_current_bankroll wurde ohne user_id aufgerufen
# ÄNDERUNG: importiert von balance_service, übergibt user_id korrekt
from sqlalchemy.orm import Session
from crud.withdrawal_crud import WithdrawalCrud
from services.balance_service import get_current_bankroll


def create(db: Session, data):
    if data.amount <= 0:
        raise ValueError("Amount must be greater than 0")

    # FIX: user_id wird jetzt übergeben → korrekte Balance pro User
    bankroll = get_current_bankroll(db, data.user_id)

    if data.amount > bankroll:
        raise ValueError(f"Nicht genug Bankroll. Verfügbar: {bankroll:.2f}€")

    return WithdrawalCrud.create_withdrawal(db, data)


def get_all(db: Session):
    return WithdrawalCrud.get_all_withdrawals(db)


def get_one(db: Session, w_id: int):
    return WithdrawalCrud.get_withdrawal(db, w_id)


def update(db: Session, w_id: int, data):
    return WithdrawalCrud.update_withdrawal(db, w_id, data)


def delete(db: Session, w_id: int):
    return WithdrawalCrud.delete_withdrawal(db, w_id)

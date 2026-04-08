from app.model.withdrawal import Withdrawal
from uuid import uuid4
from datetime import datetime

# In-Memory DB (wenn Datenbank hinzugefügt wird)
db_withdrawals = {}


def create_withdrawal(data):
    withdrawal = Withdrawal(
        id=uuid4(),
        amount=data.amount,
        currency=data.currency,
        date=data.date,
        note=data.note,
        created_at=datetime.utc(),
        updated_at=datetime.utc()
    )
    db_withdrawals[str(withdrawal.id)] = withdrawal
    return withdrawal


def get_all_withdrawals():
    return list(db_withdrawals.values())


def get_withdrawal(w_id: str):
    return db_withdrawals.get(w_id)


def update_withdrawal(w_id: str, data):
    withdrawal = db_withdrawals.get(w_id)
    if not withdrawal:
        return None

    if data.amount is not None:
        withdrawal.amount = data.amount

    if data.note is not None:
        withdrawal.note = data.note

    withdrawal.updated_at = datetime.utcnow()
    return withdrawal


def delete_withdrawal(w_id: str):
    return db_withdrawals.pop(w_id, None)
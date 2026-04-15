from backend.app.crud.withdrawal_crud import (
    create_withdrawal,
    get_all_withdrawals,
    get_withdrawal,
    update_withdrawal,
    delete_withdrawal
)
from backend.app.services.bankroll_service import get_current_bankroll


def create(data):
    if data.amount <= 0:
        raise ValueError("Amount must be greater than 0")

    bankroll = get_current_bankroll()

    if data.amount > bankroll:
        raise ValueError("Not enough bankroll")

    return create_withdrawal(data)


def get_all():
    return get_all_withdrawals()


def get_one(w_id: str):
    return get_withdrawal(w_id)


def update(w_id: str, data):
    return update_withdrawal(w_id, data)


def delete(w_id: str):
    return delete_withdrawal(w_id)
from crud.withdrawal_crud import (
    create_withdrawal,
    delete_withdrawal,
    get_all_withdrawals,
    get_withdrawal,
    update_withdrawal,
)
from schema.withdrawal_schema import WithdrawalCreate, WithdrawalUpdate


def test_withdrawal_crud_lifecycle(aware_datetime):
    created = create_withdrawal(
        WithdrawalCreate(amount=50.0, currency="EUR", date=aware_datetime, note="ATM")
    )

    fetched = get_withdrawal(str(created.id))
    updated = update_withdrawal(str(created.id), WithdrawalUpdate(amount=60.0, note="Cashier"))
    all_withdrawals = get_all_withdrawals()
    deleted = delete_withdrawal(str(created.id))

    assert fetched.id == created.id
    assert updated.amount == 60.0
    assert updated.note == "Cashier"
    assert len(all_withdrawals) == 1
    assert deleted.id == created.id
    assert get_withdrawal(str(created.id)) is None

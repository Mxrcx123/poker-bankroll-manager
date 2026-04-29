from schema.withdrawal_schema import WithdrawalCreate, WithdrawalUpdate


def test_withdrawal_schemas_accept_expected_fields(aware_datetime):
    create_schema = WithdrawalCreate(amount=50.0, currency="EUR", date=aware_datetime, note="ATM")
    update_schema = WithdrawalUpdate(amount=60.0, note="Cashier")

    assert create_schema.currency == "EUR"
    assert create_schema.note == "ATM"
    assert update_schema.amount == 60.0
    assert update_schema.note == "Cashier"

from uuid import uuid4

from model.withdrawal import Withdrawal


def test_withdrawal_model_accepts_expected_fields(aware_datetime):
    record = Withdrawal(
        id=uuid4(),
        amount=25.5,
        currency="EUR",
        date=aware_datetime,
        note="Cash out",
        created_at=aware_datetime,
        updated_at=aware_datetime,
    )

    assert record.amount == 25.5
    assert record.currency == "EUR"
    assert record.note == "Cash out"

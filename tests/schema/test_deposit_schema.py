import pytest
from pydantic import ValidationError

from schema.deposit_schema import DepositCreate, DepositResponse


def test_deposit_create_rejects_non_positive_amount():
    with pytest.raises(ValidationError):
        DepositCreate(amount=0)


def test_deposit_response_accepts_expected_fields():
    response = DepositResponse(id=1, amount=50.0, bankroll=150.0)

    assert response.amount == 50.0
    assert response.bankroll == 150.0

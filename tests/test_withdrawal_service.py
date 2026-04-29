import pytest
from unittest.mock import Mock, patch
from backend.services.withdrawal_service import create


class DummyWithdrawal:
    def __init__(self, amount):
        self.amount = amount


@patch("backend.services.withdrawal_service.create_withdrawal")
@patch("backend.services.withdrawal_service.get_current_bankroll")
def test_create_withdrawal_success(mock_bankroll, mock_create_withdrawal):
    db = Mock()
    user_id = 1
    data = DummyWithdrawal(100)

    mock_bankroll.return_value = 500
    mock_create_withdrawal.return_value = Mock(
        amount=-100,
        event_type="WITHDRAWAL"
    )

    result = create(db, user_id, data)

    mock_bankroll.assert_called_once_with(db, user_id)
    mock_create_withdrawal.assert_called_once_with(
        db=db,
        user_id=user_id,
        amount=-100,
        event_type="WITHDRAWAL"
    )

    assert result.amount == -100
    assert result.event_type == "WITHDRAWAL"


def test_create_withdrawal_invalid_amount():
    db = Mock()
    user_id = 1
    data = DummyWithdrawal(-50)

    with pytest.raises(ValueError, match="Amount must be greater than 0"):
        create(db, user_id, data)


@patch("backend.services.withdrawal_service.get_current_bankroll")
def test_create_withdrawal_not_enough_bankroll(mock_bankroll):
    db = Mock()
    user_id = 1
    data = DummyWithdrawal(100)

    mock_bankroll.return_value = 50

    with pytest.raises(ValueError, match="Not enough bankroll"):
        create(db, user_id, data)
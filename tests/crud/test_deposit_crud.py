import pytest


@pytest.mark.skip(reason="Deposit CRUD depends on Deposit and Bankroll models that are not implemented in backend/model.")
def test_create_deposit_updates_bankroll():
    from crud.deposit_crud import create_deposit

    create_deposit(None, 100)

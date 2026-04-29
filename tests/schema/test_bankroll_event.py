from decimal import Decimal

from schema.bankroll_event import BankrollEventCreate, BankrollEventResponse, BankrollEventUpdate


def test_bankroll_event_schemas_validate_and_serialize(bankroll_event):
    create_schema = BankrollEventCreate(user_id=1, amount="10.50", event_type="deposit", notes="Seed")
    update_schema = BankrollEventUpdate(amount="15.00", notes="Updated")
    response_schema = BankrollEventResponse.model_validate(bankroll_event)

    assert create_schema.amount == Decimal("10.50")
    assert update_schema.amount == Decimal("15.00")
    assert response_schema.id == bankroll_event.id
    assert response_schema.amount == Decimal("25.00")

from sqlalchemy import inspect

from model.bankroll_events import BankrollEvent


def test_bankroll_event_model_columns_and_relationships():
    mapper = inspect(BankrollEvent)

    assert BankrollEvent.__tablename__ == "bankroll_events"
    assert mapper.columns["amount"].nullable is False
    assert mapper.columns["event_type"].nullable is False
    assert mapper.columns["notes"].nullable is True
    assert "user" in mapper.relationships.keys()

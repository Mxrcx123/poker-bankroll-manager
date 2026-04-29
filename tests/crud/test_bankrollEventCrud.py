from decimal import Decimal

from crud.bankrollEventCrud import BankrollEventCrud


def test_bankroll_event_crud_lifecycle(db_session, user, second_user):
    created = BankrollEventCrud.create_bankroll_event(db_session, user.id, 75.5, "deposit", "Top-up")
    other = BankrollEventCrud.create_bankroll_event(db_session, second_user.id, 20, "withdrawal", "Cash out")

    fetched = BankrollEventCrud.get_bankroll_event_by_id(db_session, created.id)
    by_user = BankrollEventCrud.get_bankroll_events_by_user_id(db_session, user.id)
    by_type = BankrollEventCrud.get_bankroll_events_by_type(db_session, "deposit")
    updated = BankrollEventCrud.update_bankroll_event(db_session, created.id, amount=80, notes="Updated")
    deleted = BankrollEventCrud.delete_bankroll_event(db_session, created.id)

    assert fetched.id == created.id
    assert [event.id for event in by_user] == [created.id]
    assert [event.id for event in by_type] == [created.id]
    assert updated.amount == Decimal("80.00")
    assert updated.notes == "Updated"
    assert deleted.id == created.id
    assert BankrollEventCrud.get_bankroll_event_by_id(db_session, created.id) is None
    assert BankrollEventCrud.get_bankroll_event_by_id(db_session, other.id).id == other.id


def test_bankroll_event_update_missing_record_returns_none(db_session):
    assert BankrollEventCrud.update_bankroll_event(db_session, 999, amount=10) is None

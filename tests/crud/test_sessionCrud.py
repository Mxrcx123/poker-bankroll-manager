# File Change Auther: "Stefan Derler"

from decimal import Decimal

# // Story 12
from model.cash_session import CashSession
from crud.sessionCrud import SessionCrud


def test_session_crud_lifecycle(db_session, user, game_mode, platform):
    created = SessionCrud.create_session(db_session, user.id, game_mode.id, platform.id, "First notes")

    fetched = SessionCrud.get_session_by_id(db_session, created.id)
    by_user = SessionCrud.get_sessions_by_user_id(db_session, user.id)
    by_game_mode = SessionCrud.get_sessions_by_game_mode_id(db_session, game_mode.id)
    by_platform = SessionCrud.get_sessions_by_platform_id(db_session, platform.id)
    updated = SessionCrud.update_session(db_session, created.id, notes="Updated notes")
    deleted = SessionCrud.delete_session(db_session, created.id)

    assert fetched.id == created.id
    assert [session.id for session in by_user] == [created.id]
    assert [session.id for session in by_game_mode] == [created.id]
    assert [session.id for session in by_platform] == [created.id]
    assert updated.notes == "Updated notes"
    assert deleted.id == created.id
    assert SessionCrud.get_session_by_id(db_session, created.id) is None


def test_session_update_missing_record_returns_none(db_session):
    assert SessionCrud.update_session(db_session, 999, notes="Missing") is None


# // Story 12
def test_session_close_calculates_cash_game_profit(db_session, session_record, aware_datetime):
    cash_session = CashSession(session_id=session_record.id, buy_in=Decimal("100.00"), cash_out=Decimal("145.50"))
    db_session.add(cash_session)
    db_session.commit()

    SessionCrud.update_session(db_session, session_record.id, ended_at=aware_datetime)

    db_session.refresh(cash_session)
    assert cash_session.profit_loss == Decimal("45.50")


# // Story 12
def test_session_close_calculates_cash_game_loss(db_session, session_record, aware_datetime):
    cash_session = CashSession(session_id=session_record.id, buy_in=Decimal("100.00"), cash_out=Decimal("75.00"))
    db_session.add(cash_session)
    db_session.commit()

    SessionCrud.update_session(db_session, session_record.id, ended_at=aware_datetime)

    db_session.refresh(cash_session)
    assert cash_session.profit_loss == Decimal("-25.00")


# // Story 12
def test_session_close_does_not_calculate_result_without_cash_out(db_session, session_record, aware_datetime):
    cash_session = CashSession(session_id=session_record.id, buy_in=Decimal("100.00"))
    db_session.add(cash_session)
    db_session.commit()

    SessionCrud.update_session(db_session, session_record.id, ended_at=aware_datetime)

    db_session.refresh(cash_session)
    assert cash_session.profit_loss is None

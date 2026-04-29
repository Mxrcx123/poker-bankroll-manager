from decimal import Decimal

from crud.cashSessionCrud import CashSessionCrud


def test_cash_session_crud_lifecycle(db_session, session_record):
    created = CashSessionCrud.create_cash_session(db_session, session_record.id, 100, 140)

    fetched = CashSessionCrud.get_cash_session_by_id(db_session, created.id)
    by_session = CashSessionCrud.get_cash_session_by_session_id(db_session, session_record.id)
    updated = CashSessionCrud.update_cash_session(db_session, created.id, buy_in=120, cash_out=160)
    deleted = CashSessionCrud.delete_cash_session(db_session, created.id)

    assert fetched.id == created.id
    assert by_session.id == created.id
    assert updated.buy_in == Decimal("120.00")
    assert updated.cash_out == Decimal("160.00")
    assert deleted.id == created.id
    assert CashSessionCrud.get_cash_session_by_id(db_session, created.id) is None


def test_cash_session_update_missing_record_returns_none(db_session):
    assert CashSessionCrud.update_cash_session(db_session, 999, buy_in=100) is None

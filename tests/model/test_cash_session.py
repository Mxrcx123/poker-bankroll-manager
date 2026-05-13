from sqlalchemy import inspect

from model.cash_session import CashSession


def test_cash_session_model_columns_and_relationships():
    mapper = inspect(CashSession)

    assert CashSession.__tablename__ == "cash_sessions"
    assert mapper.columns["session_id"].nullable is False
    assert mapper.columns["session_id"].unique is True
    assert mapper.columns["buy_in"].nullable is False
    assert mapper.columns["cash_out"].nullable is True
    assert "session" in mapper.relationships.keys()


def test_cash_session_can_exist_without_cash_out(db_session, session_record):
    cash_session = CashSession(session_id=session_record.id, buy_in=100)

    db_session.add(cash_session)
    db_session.commit()
    db_session.refresh(cash_session)

    assert cash_session.cash_out is None

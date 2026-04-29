from sqlalchemy import inspect

from model.cash_session import CashSession


def test_cash_session_model_columns_and_relationships():
    mapper = inspect(CashSession)

    assert CashSession.__tablename__ == "cash_sessions"
    assert mapper.columns["session_id"].nullable is False
    assert mapper.columns["session_id"].unique is True
    assert mapper.columns["buy_in"].nullable is False
    assert "session" in mapper.relationships.keys()

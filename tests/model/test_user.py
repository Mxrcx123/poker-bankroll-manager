from sqlalchemy import inspect

from model.user import User


def test_user_model_columns_and_relationships():
    mapper = inspect(User)

    assert User.__tablename__ == "users"
    assert mapper.columns["username"].nullable is False
    assert mapper.columns["username"].unique is True
    assert mapper.columns["password"].nullable is False
    assert {"sessions", "bankroll_events", "bankroll_snapshots"} <= set(mapper.relationships.keys())

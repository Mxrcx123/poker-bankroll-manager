from sqlalchemy import inspect

from model.bankroll_snapshot import BankrollSnapshot


def test_bankroll_snapshot_model_columns_and_relationships():
    mapper = inspect(BankrollSnapshot)

    assert BankrollSnapshot.__tablename__ == "bankroll_snapshots"
    assert mapper.columns["amount"].nullable is False
    assert mapper.columns["recorded_at"].nullable is False
    assert "user" in mapper.relationships.keys()

from decimal import Decimal
from datetime import timedelta

from crud.bankrollSnapshotCrud import BankrollSnapshotCrud


def test_bankroll_snapshot_crud_lifecycle(db_session, user):
    first = BankrollSnapshotCrud.create_bankroll_snapshot(db_session, user.id, 500)
    second = BankrollSnapshotCrud.create_bankroll_snapshot(db_session, user.id, 700)
    first.recorded_at = first.recorded_at - timedelta(days=1)
    db_session.commit()

    fetched = BankrollSnapshotCrud.get_bankroll_snapshot_by_id(db_session, first.id)
    by_user = BankrollSnapshotCrud.get_bankroll_snapshots_by_user_id(db_session, user.id)
    latest = BankrollSnapshotCrud.get_latest_bankroll_snapshot_by_user_id(db_session, user.id)
    updated = BankrollSnapshotCrud.update_bankroll_snapshot(db_session, first.id, amount=550)
    deleted = BankrollSnapshotCrud.delete_bankroll_snapshot(db_session, first.id)

    assert fetched.id == first.id
    assert [snapshot.id for snapshot in by_user] == [first.id, second.id]
    assert latest.id == second.id
    assert updated.amount == Decimal("550.00")
    assert deleted.id == first.id
    assert BankrollSnapshotCrud.get_bankroll_snapshot_by_id(db_session, first.id) is None


def test_bankroll_snapshot_update_missing_record_returns_none(db_session):
    assert BankrollSnapshotCrud.update_bankroll_snapshot(db_session, 999, amount=10) is None

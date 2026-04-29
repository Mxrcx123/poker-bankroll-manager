from decimal import Decimal

from schema.bankroll_snapshot import (
    BankrollSnapshotCreate,
    BankrollSnapshotResponse,
    BankrollSnapshotUpdate,
)


def test_bankroll_snapshot_schemas_validate_and_serialize(bankroll_snapshot):
    create_schema = BankrollSnapshotCreate(user_id=1, amount="1000.00")
    update_schema = BankrollSnapshotUpdate(amount="1100.00")
    response_schema = BankrollSnapshotResponse.model_validate(bankroll_snapshot)

    assert create_schema.amount == Decimal("1000.00")
    assert update_schema.amount == Decimal("1100.00")
    assert response_schema.id == bankroll_snapshot.id
    assert response_schema.amount == Decimal("500.00")

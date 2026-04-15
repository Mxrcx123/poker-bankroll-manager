from sqlalchemy.orm import Session
from ..model.bankroll_snapshot import BankrollSnapshot


class BankrollSnapshotCrud():
    @staticmethod
    def create_bankroll_snapshot(db: Session, user_id: int, amount: float):
        new_snapshot = BankrollSnapshot(
            user_id=user_id,
            amount=amount
        )
        db.add(new_snapshot)
        db.commit()
        db.refresh(new_snapshot)
        return new_snapshot

    @staticmethod
    def get_bankroll_snapshot_by_id(db: Session, snapshot_id: int):
        return db.query(BankrollSnapshot).filter(BankrollSnapshot.id == snapshot_id).first()

    @staticmethod
    def get_bankroll_snapshots_by_user_id(db: Session, user_id: int):
        return db.query(BankrollSnapshot).filter(BankrollSnapshot.user_id == user_id).all()

    @staticmethod
    def get_latest_bankroll_snapshot_by_user_id(db: Session, user_id: int):
        return db.query(BankrollSnapshot).filter(BankrollSnapshot.user_id == user_id)\
            .order_by(BankrollSnapshot.recorded_at.desc()).first()

    @staticmethod
    def update_bankroll_snapshot(db: Session, snapshot_id: int, amount: float = None):
        snapshot = db.query(BankrollSnapshot).filter(BankrollSnapshot.id == snapshot_id).first()
        if not snapshot:
            return None
        if amount is not None:
            snapshot.amount = amount
        db.commit()
        db.refresh(snapshot)
        return snapshot

    @staticmethod
    def delete_bankroll_snapshot(db: Session, snapshot_id: int):
        snapshot = db.query(BankrollSnapshot).filter(BankrollSnapshot.id == snapshot_id).first()
        if snapshot:
            db.delete(snapshot)
            db.commit()
        return snapshot

from sqlalchemy.orm import Session
from ..model.bankroll_events import BankrollEvent


class BankrollEventCrud():
    @staticmethod
    def create_bankroll_event(db: Session, user_id: int, amount: float, event_type: str, notes: str = None):
        new_event = BankrollEvent(
            user_id=user_id,
            amount=amount,
            event_type=event_type,
            notes=notes
        )
        db.add(new_event)
        db.commit()
        db.refresh(new_event)
        return new_event

    @staticmethod
    def get_bankroll_event_by_id(db: Session, event_id: int):
        return db.query(BankrollEvent).filter(BankrollEvent.id == event_id).first()

    @staticmethod
    def get_bankroll_events_by_user_id(db: Session, user_id: int):
        return db.query(BankrollEvent).filter(BankrollEvent.user_id == user_id).all()

    @staticmethod
    def get_bankroll_events_by_type(db: Session, event_type: str):
        return db.query(BankrollEvent).filter(BankrollEvent.event_type == event_type).all()

    @staticmethod
    def update_bankroll_event(db: Session, event_id: int, amount: float = None, 
                              event_type: str = None, notes: str = None):
        event = db.query(BankrollEvent).filter(BankrollEvent.id == event_id).first()
        if not event:
            return None
        if amount is not None:
            event.amount = amount
        if event_type is not None:
            event.event_type = event_type
        if notes is not None:
            event.notes = notes
        db.commit()
        db.refresh(event)
        return event

    @staticmethod
    def delete_bankroll_event(db: Session, event_id: int):
        event = db.query(BankrollEvent).filter(BankrollEvent.id == event_id).first()
        if event:
            db.delete(event)
            db.commit()
        return event

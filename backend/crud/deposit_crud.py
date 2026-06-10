# Überarbeitet von Andreas Haas
# ÄNDERUNG: Balance wird nach jedem Deposit neu berechnet und bei User gespeichert
from sqlalchemy.orm import Session
from model.deposit import Deposit
from model.bankroll_events import BankrollEvent
from schema.deposit_schema import DepositCreate, DepositUpdate
from services import balance_service
from datetime import datetime


class DepositCrud:

    @staticmethod
    def create_deposit(db: Session, deposit: DepositCreate):
        event_date = datetime.now()
        if deposit.date:
            event_date = datetime.combine(deposit.date, datetime.min.time())

        # 1. Deposit-Eintrag erstellen
        db_deposit = Deposit(
            user_id=deposit.user_id,
            amount=deposit.amount,
            date=event_date,
            notes=deposit.notes
        )
        db.add(db_deposit)

        # 2. BankrollEvent mit positivem Betrag → erhöht die Balance
        db_event = BankrollEvent(
            user_id=deposit.user_id,
            amount=deposit.amount,
            event_type="DEPOSIT",
            occurred_at=event_date,
            notes=deposit.notes or "Einzahlung erfasst"
        )
        db.add(db_event)

        # 3. Balance aus BankrollEvents berechnen (SQLAlchemy flusht vor der Query,
        #    daher wird das neue Event bereits mitzgezählt) und user.balance setzen
        balance_service.update_balance_no_commit(db, deposit.user_id)

        # 4. Alles auf einmal committen: Deposit + BankrollEvent + user.balance
        db.commit()
        db.refresh(db_deposit)

        return db_deposit

    @staticmethod
    def get_deposit(db: Session, deposit_id: int):
        return db.query(Deposit).filter(Deposit.id == deposit_id).first()

    @staticmethod
    def get_deposits_by_user(db: Session, user_id: int):
        return db.query(Deposit).filter(Deposit.user_id == user_id).all()

    @staticmethod
    def update_deposit(db: Session, deposit_id: int, deposit_data: DepositUpdate):
        db_deposit = db.query(Deposit).filter(Deposit.id == deposit_id).first()
        if db_deposit:
            if deposit_data.amount is not None:
                db_deposit.amount = deposit_data.amount
            if deposit_data.notes is not None:
                db_deposit.notes = deposit_data.notes
            db.commit()
            db.refresh(db_deposit)
        return db_deposit

    @staticmethod
    def delete_deposit(db: Session, deposit_id: int):
        db_deposit = db.query(Deposit).filter(Deposit.id == deposit_id).first()
        if db_deposit:
            db.delete(db_deposit)
            db.commit()
        return db_deposit

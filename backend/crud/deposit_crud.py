# Überarbeitet von Andreas Haas & gelöst
from sqlalchemy.orm import Session
from model.deposit import Deposit
from model.bankroll_events import BankrollEvent  # <-- NEU: Importiert das Bankroll-Event-Model
from schema.deposit_schema import DepositCreate, DepositUpdate
from datetime import datetime

class DepositCrud:

    @staticmethod
    def create_deposit(db: Session, deposit: DepositCreate):
        # Datum sauber verarbeiten (Falls es ein reines 'date' ist, zu 'datetime' konvertieren)
        event_date = datetime.now()
        if deposit.date:
            event_date = datetime.combine(deposit.date, datetime.min.time())

        # 1. Eintrag für die "deposits"-Tabelle erstellen
        db_deposit = Deposit(
            user_id=deposit.user_id,
            amount=deposit.amount,
            date=event_date,   
            notes=deposit.notes
        )
        db.add(db_deposit)

        # 2. NEU: Eintrag für die "bankroll_events"-Tabelle erstellen, damit sich die Balance ändert!
        db_event = BankrollEvent(
            user_id=deposit.user_id,
            amount=deposit.amount,         # Positiver Betrag erhöht die Bankroll
            event_type="DEPOSIT",          # Typ, damit dein Dashboard weiß, woher das Geld kommt
            occurred_at=event_date,
            notes=deposit.notes or "Einzahlung erfasst"
        )
        db.add(db_event)

        # 3. Beide Einträge gleichzeitig in die Datenbank committen
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
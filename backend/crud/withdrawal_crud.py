# Überarbeitet von Andreas Haas
# BUG FIXES:
#   - user_id wurde beim Erstellen nie gesetzt
#   - Kein BankrollEvent wurde erstellt → Balance wurde nie reduziert
# ÄNDERUNG: BankrollEvent mit negativem Betrag + Balance-Neuberechnung
from sqlalchemy.orm import Session
from model.withdrawal import Withdrawal
from model.bankroll_events import BankrollEvent
from services import balance_service
from datetime import datetime


class WithdrawalCrud:

    @staticmethod
    def create_withdrawal(db: Session, data):
        event_date = datetime.now()
        if data.date:
            event_date = (
                data.date if isinstance(data.date, datetime)
                else datetime.combine(data.date, datetime.min.time())
            )

        # 1. Withdrawal-Eintrag erstellen
        db_withdrawal = Withdrawal(
            user_id=data.user_id,   # FIX: war vergessen → Withdrawals hatten keinen User
            amount=data.amount,
            currency=data.currency,
            date=event_date,
            note=data.note
        )
        db.add(db_withdrawal)

        # 2. NEU: BankrollEvent mit NEGATIVEM Betrag → reduziert die Balance
        db_event = BankrollEvent(
            user_id=data.user_id,
            amount=-data.amount,    # Negativ, da Auszahlung
            event_type="WITHDRAWAL",
            occurred_at=event_date,
            notes=data.note or "Auszahlung erfasst"
        )
        db.add(db_event)

        # 3. Balance neu berechnen (inkl. dem neuen negativen Event) und user.balance setzen
        balance_service.update_balance_no_commit(db, data.user_id)

        # 4. Alles auf einmal committen
        db.commit()
        db.refresh(db_withdrawal)

        return db_withdrawal

    @staticmethod
    def get_all_withdrawals(db: Session):
        return db.query(Withdrawal).all()

    @staticmethod
    def get_withdrawal(db: Session, w_id: int):
        return db.query(Withdrawal).filter(Withdrawal.id == w_id).first()

    @staticmethod
    def update_withdrawal(db: Session, w_id: int, data):
        db_withdrawal = db.query(Withdrawal).filter(Withdrawal.id == w_id).first()
        if not db_withdrawal:
            return None
        if data.amount is not None:
            db_withdrawal.amount = data.amount
        if data.note is not None:
            db_withdrawal.note = data.note
        db.commit()
        db.refresh(db_withdrawal)
        return db_withdrawal

    @staticmethod
    def delete_withdrawal(db: Session, w_id: int):
        db_withdrawal = db.query(Withdrawal).filter(Withdrawal.id == w_id).first()
        if not db_withdrawal:
            return None
        db.delete(db_withdrawal)
        db.commit()
        return db_withdrawal

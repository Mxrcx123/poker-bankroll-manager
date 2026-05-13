from sqlalchemy.orm import Session
#from backend.database.models import Deposit, Bankroll


def create_deposit(db: Session, amount: float) -> tuple[Deposit, Bankroll]:
    deposit = Deposit(amount=amount)
    db.add(deposit)

    bankroll = db.query(Bankroll).first()

    if bankroll is None:
        bankroll = Bankroll(amount=0)
        db.add(bankroll)
        db.flush()

    bankroll.amount += amount

    db.commit()
    db.refresh(deposit)
    db.refresh(bankroll)

    return deposit, bankroll
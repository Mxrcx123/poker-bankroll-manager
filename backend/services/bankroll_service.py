from crud.withdrawal_crud import db_withdrawals

def get_current_bankroll():
    base_bankroll = 1000  # jetzt Startwert (später aus DB berechnen)

    total_withdrawals = sum(w.amount for w in db_withdrawals.values())

    return base_bankroll - total_withdrawals
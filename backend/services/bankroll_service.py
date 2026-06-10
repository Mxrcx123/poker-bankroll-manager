# Überarbeitet
# BUG FIX: war hardcoded auf 1000, kannte keine user_id, ignorierte Deposits
# ÄNDERUNG: delegiert jetzt an balance_service (user.balance)
from sqlalchemy.orm import Session
from services.balance_service import get_current_bankroll, recalculate_balance

# get_current_bankroll(db, user_id) → float  (aus user.balance)
# recalculate_balance(db, user_id) → float   (neu berechnen + committen)

__all__ = ["get_current_bankroll", "recalculate_balance"]

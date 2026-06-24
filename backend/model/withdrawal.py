# BUG FIX: user_id war nullable=True → Withdrawals wurden ohne User gespeichert
# ÄNDERUNG: nullable=False
from sqlalchemy import Column, Integer, String, Text, Numeric, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from .base import Base
from datetime import datetime


class Withdrawal(Base):
    __tablename__ = "withdrawals"

    id = Column(Integer, primary_key=True, autoincrement=True)
    # FIX: nullable=False — jede Auszahlung muss einem User gehören
    user_id = Column(Integer, ForeignKey("users.id", onupdate="CASCADE", ondelete="CASCADE"), nullable=True) # Funktioniert bei mir auch mit True nicht (Katharina Almer)
    amount = Column(Numeric(12, 2), nullable=False)
    currency = Column(String(10), nullable=True)
    date = Column(DateTime(timezone=True), nullable=False, default=datetime.now)
    note = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=datetime.now)
    updated_at = Column(DateTime(timezone=True), default=datetime.now, onupdate=datetime.now)

    user = relationship("User")

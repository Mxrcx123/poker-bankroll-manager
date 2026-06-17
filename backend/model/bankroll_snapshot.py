#Überarbeitet von Andreas Haas
from sqlalchemy import Column, Integer, Numeric, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from .base import Base
from datetime import datetime


class BankrollSnapshot(Base):
    __tablename__ = "bankroll_snapshots"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", onupdate="CASCADE", ondelete="CASCADE"), nullable=False)
    amount = Column(Numeric(12, 2), nullable=False)
    recorded_at = Column(DateTime(timezone=True), nullable=False, default=datetime.now)

    user = relationship("User", back_populates="bankroll_snapshots")
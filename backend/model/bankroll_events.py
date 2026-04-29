from sqlalchemy import Column, Integer, String, Text, Numeric, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from .base import Base, now


class BankrollEvent(Base):
    __tablename__ = "bankroll_events"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", onupdate="CASCADE", ondelete="CASCADE"), nullable=False)
    amount = Column(Numeric(12, 2), nullable=False)
    event_type = Column(String(50), nullable=False)
    occurred_at = Column(DateTime(timezone=True), nullable=False, default=now)
    notes = Column(Text, nullable=True)

    user = relationship("User", back_populates="bankroll_events")
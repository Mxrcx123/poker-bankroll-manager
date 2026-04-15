from sqlalchemy import Column, Integer, Numeric, ForeignKey
from sqlalchemy.orm import relationship
from .base import Base


class CashSession(Base):
    __tablename__ = "cash_sessions"

    id = Column(Integer, primary_key=True, autoincrement=True)
    session_id = Column(Integer, ForeignKey("sessions.id", onupdate="CASCADE", ondelete="CASCADE"), unique=True, nullable=False)
    buy_in = Column(Numeric(12, 2), nullable=False)
    cash_out = Column(Numeric(12, 2), nullable=True)

    session = relationship("Session", back_populates="cash_session")
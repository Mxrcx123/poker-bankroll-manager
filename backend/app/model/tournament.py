from sqlalchemy import Column, Integer, Numeric, ForeignKey
from sqlalchemy.orm import relationship
from .base import Base


class Tournament(Base):
    __tablename__ = "tournaments"

    id = Column(Integer, primary_key=True, autoincrement=True)
    session_id = Column(Integer, ForeignKey("sessions.id", onupdate="CASCADE", ondelete="CASCADE"), unique=True, nullable=False)
    buy_in = Column(Numeric(12, 2), nullable=False)
    fee = Column(Numeric(12, 2), nullable=True)
    rebuys = Column(Integer, nullable=False, default=0)
    rebuy_cost = Column(Numeric(12, 2), nullable=True)
    add_ons = Column(Integer, nullable=False, default=0)
    add_on_cost = Column(Numeric(12, 2), nullable=True)
    winnings = Column(Numeric(12, 2), nullable=False, default=0)
    finish_position = Column(Integer, nullable=True)

    session = relationship("Session", back_populates="tournament")
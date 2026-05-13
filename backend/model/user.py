from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.orm import relationship
from .base import Base, now


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, autoincrement=True)
    username = Column(String(25), unique=True, nullable=False)
    password = Column(String(255), nullable=False)
    created_at = Column(DateTime(timezone=True), nullable=False, default=now)

    sessions = relationship("Session", back_populates="user", cascade="all, delete")
    bankroll_events = relationship("BankrollEvent", back_populates="user", cascade="all, delete")
    bankroll_snapshots = relationship("BankrollSnapshot", back_populates="user", cascade="all, delete")
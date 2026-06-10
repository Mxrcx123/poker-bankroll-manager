# Überarbeitet von Andreas Haas
# ÄNDERUNG: balance-Spalte hinzugefügt
from sqlalchemy import Column, Integer, String, DateTime, Numeric
from sqlalchemy.orm import relationship
from .base import Base
from datetime import datetime


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, autoincrement=True)
    username = Column(String(25), unique=True, nullable=False)
    password = Column(String(255), nullable=False)
    created_at = Column(DateTime(timezone=True), nullable=False, default=datetime.now)
    # NEU: Gespeicherte Bankroll-Balance. Wird nach jedem Deposit/Withdrawal
    #      automatisch aus der bankroll_events-Tabelle neu berechnet.
    #      ACHTUNG: Alembic-Migration nötig → alembic revision --autogenerate
    balance = Column(Numeric(12, 2), nullable=False, default=0)

    sessions = relationship("Session", back_populates="user", cascade="all, delete")
    bankroll_events = relationship("BankrollEvent", back_populates="user", cascade="all, delete")
    bankroll_snapshots = relationship("BankrollSnapshot", back_populates="user", cascade="all, delete")

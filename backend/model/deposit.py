#Überarbeitet von Andreas Haas
from sqlalchemy import Column, Integer, Text, Numeric, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from .base import Base
from datetime import datetime

class Deposit(Base):
    __tablename__ = "deposits"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", onupdate="CASCADE", ondelete="CASCADE"), nullable=False)
    amount = Column(Numeric(12, 2), nullable=False)
    date = Column(DateTime(timezone=True), nullable=False, default=datetime.now)
    notes = Column(Text, nullable=True)

    user = relationship("User")

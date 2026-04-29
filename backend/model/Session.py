from sqlalchemy import Column, Integer, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from .base import Base, now


class Session(Base):
    __tablename__ = "sessions"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", onupdate="CASCADE", ondelete="CASCADE"), nullable=False)
    game_mode_id = Column(Integer, ForeignKey("game_modes.id", onupdate="CASCADE", ondelete="RESTRICT"), nullable=False)
    platform_id = Column(Integer, ForeignKey("platforms.id", onupdate="CASCADE", ondelete="SET NULL"), nullable=True)
    started_at = Column(DateTime(timezone=True), nullable=False, default=now)
    ended_at = Column(DateTime(timezone=True), nullable=True)
    notes = Column(Text, nullable=True)

    user = relationship("User", back_populates="sessions")
    game_mode = relationship("GameMode", back_populates="sessions")
    platform = relationship("Platform", back_populates="sessions")
    cash_session = relationship("CashSession", back_populates="session", uselist=False, cascade="all, delete")
    tournament = relationship("Tournament", back_populates="session", uselist=False, cascade="all, delete")

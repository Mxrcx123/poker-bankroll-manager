from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from .base import Base


class GameMode(Base):
    __tablename__ = "game_modes"

    id = Column(Integer, primary_key=True, autoincrement=True)
    title = Column(String(50), unique=True, nullable=False)

    sessions = relationship("Session", back_populates="game_mode")
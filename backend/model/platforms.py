from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from .base import Base


class Platform(Base):
    __tablename__ = "platforms"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(255), unique=True, nullable=False)

    sessions = relationship("Session", back_populates="platform")
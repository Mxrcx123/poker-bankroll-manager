import sqlalchemy
from sqlalchemy.orm import Session, Integer, String

class Platforms(Base):
    __tablename__ = "platforms"
    
    id = Column(Integer, primary_key=True)
    name = Column(String(100))
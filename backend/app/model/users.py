import sqlalchemy
from sqlalchemy.orm import Session, Integer, String, Datetime
from datetime import datetime, timezone

class Users(Base):
    __tablename__ = "users"
    
    id = Column(Interger, primary_key=True)
    username = Column(String(100))
    password = Column(String(100))
    created_at = Column(Datetime, default=lambda: datetime.now(timezone.gmt))
    
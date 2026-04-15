import sqlalchemy
from sqlalchemy.orm import Session
from hashlib import sha256
from app.model.user import User

class UserCrud():
    @staticmethod
    def create_user(db: Session, username: str, password: str):
        sha256_hash = hashlib.sha256()
        sha256_hash.update(password.encode())
        password = sha256_hash.hexdigest()
        new_user = User(
            username = username,
            password = password
        )
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        return new_user
    
    @staticmethod
    def get_user_by_id(db: Session, id: str):
        return db.query(User).filter(User.id == id)
    
    @staticmethod
    def update_user_by_id(db: Session, userid: int, new_username: str, newpassword: str):
        user = db.query(User).filter(User.id == userid)
        user.name = new_username
        sha256_hash = hashlib.sha256()
        sha256_hash.update(newpassword.encode())
        user.password = sha256_hash.hexdigest()
        db.commit()
        return user
    
    @staticmethod
    def delete_user_by_id(db: Session, userid: int):
        user = db.query(User).filter(User.id == userid)
        db.delete(user)
        db.commit
    
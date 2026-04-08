import hashlib
from sqlalchemy.orm import Session
from ..model.user import User


class UserCrud():
    @staticmethod
    def create_user(db: Session, username: str, password: str):
        """Create a new user with hashed password"""
        hashed_password = UserCrud._hash_password(password)
        new_user = User(
            username=username,
            password=hashed_password
        )
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        return new_user

    @staticmethod
    def get_user_by_id(db: Session, user_id: int):
        """Get user by ID"""
        return db.query(User).filter(User.id == user_id).first()

    @staticmethod
    def get_user_by_username(db: Session, username: str):
        """Get user by username"""
        return db.query(User).filter(User.username == username).first()

    @staticmethod
    def get_all_users(db: Session):
        """Get all users"""
        return db.query(User).all()

    @staticmethod
    def update_user_by_id(db: Session, user_id: int, new_username: str = None, new_password: str = None):
        """Update user by ID"""
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            return None
        if new_username is not None:
            user.username = new_username
        if new_password is not None:
            user.password = UserCrud._hash_password(new_password)
        db.commit()
        db.refresh(user)
        return user

    @staticmethod
    def delete_user_by_id(db: Session, user_id: int):
        """Delete user by ID"""
        user = db.query(User).filter(User.id == user_id).first()
        if user:
            db.delete(user)
            db.commit()
        return user

    @staticmethod
    def _hash_password(password: str) -> str:
        """Hash password using SHA256"""
        sha256_hash = hashlib.sha256()
        sha256_hash.update(password.encode())
        return sha256_hash.hexdigest()
from sqlalchemy.orm import Session
from backend.model.platforms import Platform


class PlatformCrud():
    @staticmethod
    def create_platform(db: Session, name: str):
        new_platform = Platform(
            name=name
        )
        db.add(new_platform)
        db.commit()
        db.refresh(new_platform)
        return new_platform

    @staticmethod
    def get_platform_by_id(db: Session, platform_id: int):
        return db.query(Platform).filter(Platform.id == platform_id).first()

    @staticmethod
    def get_platform_by_name(db: Session, name: str):
        return db.query(Platform).filter(Platform.name == name).first()

    @staticmethod
    def get_all_platforms(db: Session):
        return db.query(Platform).all()

    @staticmethod
    def update_platform(db: Session, platform_id: int, name: str = None):
        platform = db.query(Platform).filter(Platform.id == platform_id).first()
        if not platform:
            return None
        if name is not None:
            platform.name = name
        db.commit()
        db.refresh(platform)
        return platform

    @staticmethod
    def delete_platform(db: Session, platform_id: int):
        platform = db.query(Platform).filter(Platform.id == platform_id).first()
        if platform:
            db.delete(platform)
            db.commit()
        return platform

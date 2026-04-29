from sqlalchemy.orm import Session
from backend.model.game_mode import GameMode


class GameModeCrud():
    @staticmethod
    def create_game_mode(db: Session, title: str):
        new_game_mode = GameMode(
            title=title
        )
        db.add(new_game_mode)
        db.commit()
        db.refresh(new_game_mode)
        return new_game_mode

    @staticmethod
    def get_game_mode_by_id(db: Session, game_mode_id: int):
        return db.query(GameMode).filter(GameMode.id == game_mode_id).first()

    @staticmethod
    def get_game_mode_by_title(db: Session, title: str):
        return db.query(GameMode).filter(GameMode.title == title).first()

    @staticmethod
    def get_all_game_modes(db: Session):
        return db.query(GameMode).all()

    @staticmethod
    def update_game_mode(db: Session, game_mode_id: int, title: str = None):
        game_mode = db.query(GameMode).filter(GameMode.id == game_mode_id).first()
        if not game_mode:
            return None
        if title is not None:
            game_mode.title = title
        db.commit()
        db.refresh(game_mode)
        return game_mode

    @staticmethod
    def delete_game_mode(db: Session, game_mode_id: int):
        game_mode = db.query(GameMode).filter(GameMode.id == game_mode_id).first()
        if game_mode:
            db.delete(game_mode)
            db.commit()
        return game_mode

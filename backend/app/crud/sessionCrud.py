from sqlalchemy.orm import Session as DBSession
from ..model.session import Session


class SessionCrud():
    @staticmethod
    def create_session(db: DBSession, user_id: int, game_mode_id: int, platform_id: int = None, notes: str = None):
        new_session = Session(
            user_id=user_id,
            game_mode_id=game_mode_id,
            platform_id=platform_id,
            notes=notes
        )
        db.add(new_session)
        db.commit()
        db.refresh(new_session)
        return new_session

    @staticmethod
    def get_session_by_id(db: DBSession, session_id: int):
        return db.query(Session).filter(Session.id == session_id).first()

    @staticmethod
    def get_sessions_by_user_id(db: DBSession, user_id: int):
        return db.query(Session).filter(Session.user_id == user_id).all()

    @staticmethod
    def get_sessions_by_game_mode_id(db: DBSession, game_mode_id: int):
        return db.query(Session).filter(Session.game_mode_id == game_mode_id).all()

    @staticmethod
    def get_sessions_by_platform_id(db: DBSession, platform_id: int):
        return db.query(Session).filter(Session.platform_id == platform_id).all()

    @staticmethod
    def update_session(db: DBSession, session_id: int, platform_id: int = None, 
                      ended_at = None, notes: str = None):
        session = db.query(Session).filter(Session.id == session_id).first()
        if not session:
            return None
        if platform_id is not None:
            session.platform_id = platform_id
        if ended_at is not None:
            session.ended_at = ended_at
        if notes is not None:
            session.notes = notes
        db.commit()
        db.refresh(session)
        return session

    @staticmethod
    def delete_session(db: DBSession, session_id: int):
        session = db.query(Session).filter(Session.id == session_id).first()
        if session:
            db.delete(session)
            db.commit()
        return session

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from model.base import get_db
from crud.sessionCrud import SessionCrud

router = APIRouter()

@router.post("/session/{user_id}/{game_mode_id}")
# This endpoint creates a new session in the database.
async def create_session(user_id: int, game_mode_id: int, platform_id: int = None, notes: str = None, db_session: Session = Depends(get_db)):
    try:
        SessionCrud.create_session(db_session, user_id, game_mode_id, platform_id, notes)
        return {"message": "Session created successfully"}
    except Exception as e:
        return {"error": str(e)}

@router.get("/session/{session_id}")
# This endpoint returns a session based on its id.
async def get_session_by_id(session_id: int, db_session: Session = Depends(get_db)):
    try:
        session = SessionCrud.get_session_by_id(db_session, session_id)
        return {
            "message": "successfully got session",
            "id": session.id,
            "user_id": session.user_id,
            "game_mode_id": session.game_mode_id,
            "platform_id": session.platform_id,
            "notes": session.notes,
            "started_at": session.started_at,
            "ended_at": session.ended_at
        }
    except Exception as e:
        return {"error": str(e)}

@router.get("/session/user/{user_id}")
# This endpoint returns all sessions for a user.
async def get_sessions_by_user_id(user_id: int, db_session: Session = Depends(get_db)):
    try:
        sessions = SessionCrud.get_sessions_by_user_id(db_session, user_id)
        return {
            "message": "successfully got sessions",
            "sessions": [{"id": s.id, "user_id": s.user_id, "game_mode_id": s.game_mode_id, "platform_id": s.platform_id, "notes": s.notes, "started_at": s.started_at, "ended_at": s.ended_at} for s in sessions]
        }
    except Exception as e:
        return {"error": str(e)}

@router.get("/session/game-mode/{game_mode_id}")
# This endpoint returns all sessions for a game mode.
async def get_sessions_by_game_mode_id(game_mode_id: int, db_session: Session = Depends(get_db)):
    try:
        sessions = SessionCrud.get_sessions_by_game_mode_id(db_session, game_mode_id)
        return {
            "message": "successfully got sessions",
            "sessions": [{"id": s.id, "user_id": s.user_id, "game_mode_id": s.game_mode_id, "platform_id": s.platform_id, "notes": s.notes, "started_at": s.started_at, "ended_at": s.ended_at} for s in sessions]
        }
    except Exception as e:
        return {"error": str(e)}

@router.get("/session/platform/{platform_id}")
# This endpoint returns all sessions for a platform.
async def get_sessions_by_platform_id(platform_id: int, db_session: Session = Depends(get_db)):
    try:
        sessions = SessionCrud.get_sessions_by_platform_id(db_session, platform_id)
        return {
            "message": "successfully got sessions",
            "sessions": [{"id": s.id, "user_id": s.user_id, "game_mode_id": s.game_mode_id, "platform_id": s.platform_id, "notes": s.notes, "started_at": s.started_at, "ended_at": s.ended_at} for s in sessions]
        }
    except Exception as e:
        return {"error": str(e)}

@router.put("/session/{session_id}")
# This endpoint updates a session based on its id.
async def update_session(session_id: int, platform_id: int = None, ended_at = None, notes: str = None, db_session: Session = Depends(get_db)):
    try:
        SessionCrud.update_session(db_session, session_id, platform_id, ended_at, notes)
        return {"message": "successfully updated session"}
    except Exception as e:
        return {"error": str(e)}

@router.delete("/session/delete/{session_id}")
# This endpoint deletes a session based on its id.
async def delete_session(session_id: int, db_session: Session = Depends(get_db)):
    try:
        SessionCrud.delete_session(db_session, session_id)
        return {"message": "successfully deleted session"}
    except Exception as e:
        return {"error": str(e)}
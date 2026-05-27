from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from model.base import get_db
from crud.gameModeCrud import GameModeCrud

router = APIRouter()

@router.post("/game-mode/{title}")
# This endpoint creates a new game mode in the database.
async def create_game_mode(title: str, db_session: Session = Depends(get_db)):
    try:
        GameModeCrud.create_game_mode(db_session, title)
        return {"message": "Game mode created successfully"}
    except Exception as e:
        return {"error": str(e)}

@router.get("/game-mode/{game_mode_id}")
# This endpoint returns a game mode based on its id.
async def get_game_mode_by_id(game_mode_id: int, db_session: Session = Depends(get_db)):
    try:
        game_mode = GameModeCrud.get_game_mode_by_id(db_session, game_mode_id)
        return {
            "message": "successfully got game mode",
            "id": game_mode.id,
            "title": game_mode.title
        }
    except Exception as e:
        return {"error": str(e)}

@router.get("/game-mode/title/{title}")
# This endpoint returns a game mode based on its title.
async def get_game_mode_by_title(title: str, db_session: Session = Depends(get_db)):
    try:
        game_mode = GameModeCrud.get_game_mode_by_title(db_session, title)
        return {
            "message": "successfully got game mode",
            "id": game_mode.id,
            "title": game_mode.title
        }
    except Exception as e:
        return {"error": str(e)}

@router.get("/game-mode/all" )
# This endpoint returns all game modes.
async def get_all_game_modes(db_session: Session = Depends(get_db)):
    try:
        game_modes = GameModeCrud.get_all_game_modes(db_session)
        return {
            "message": "successfully got all game modes",
            "game_modes": [{"id": gm.id, "title": gm.title} for gm in game_modes]
        }
    except Exception as e:
        return {"error": str(e)}

@router.put("/game-mode/{game_mode_id}")
# This endpoint updates a game mode based on its id.
async def update_game_mode(game_mode_id: int, title: str = None, db_session: Session = Depends(get_db)):
    try:
        GameModeCrud.update_game_mode(db_session, game_mode_id, title)
        return {"message": "successfully updated game mode"}
    except Exception as e:
        return {"error": str(e)}

@router.delete("/game-mode/delete/{game_mode_id}")
# This endpoint deletes a game mode based on its id.
async def delete_game_mode(game_mode_id: int, db_session: Session = Depends(get_db)):
    try:
        GameModeCrud.delete_game_mode(db_session, game_mode_id)
        return {"message": "successfully deleted game mode"}
    except Exception as e:
        return {"error": str(e)}
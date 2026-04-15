from fastapi import FastAPI
from sqlalchemy.orm import Session
from backend.app.crud.gameModeCrud import GameModeCrud

app = FastAPI()

@app.post("/game-mode/{db_session}/{title}")
# This endpoint creates a new game mode in the database.
async def create_game_mode(db_session: Session, title: str):
    try:
        GameModeCrud.create_game_mode(db_session, title)
        return {"message": "Game mode created successfully"}
    except Exception as e:
        return {"error": str(e)}

@app.get("/game-mode/{db_session}/{game_mode_id}")
# This endpoint returns a game mode based on its id.
async def get_game_mode_by_id(db_session: Session, game_mode_id: int):
    try:
        game_mode = GameModeCrud.get_game_mode_by_id(db_session, game_mode_id)
        return {
            "message": "successfully got game mode",
            "id": game_mode.id,
            "title": game_mode.title
        }
    except Exception as e:
        return {"error": str(e)}

@app.get("/game-mode/title/{db_session}/{title}")
# This endpoint returns a game mode based on its title.
async def get_game_mode_by_title(db_session: Session, title: str):
    try:
        game_mode = GameModeCrud.get_game_mode_by_title(db_session, title)
        return {
            "message": "successfully got game mode",
            "id": game_mode.id,
            "title": game_mode.title
        }
    except Exception as e:
        return {"error": str(e)}

@app.get("/game-mode/all/{db_session}")
# This endpoint returns all game modes.
async def get_all_game_modes(db_session: Session):
    try:
        game_modes = GameModeCrud.get_all_game_modes(db_session)
        return {
            "message": "successfully got all game modes",
            "game_modes": [{"id": gm.id, "title": gm.title} for gm in game_modes]
        }
    except Exception as e:
        return {"error": str(e)}

@app.put("/game-mode/{db_session}/{game_mode_id}")
# This endpoint updates a game mode based on its id.
async def update_game_mode(db_session: Session, game_mode_id: int, title: str = None):
    try:
        GameModeCrud.update_game_mode(db_session, game_mode_id, title)
        return {"message": "successfully updated game mode"}
    except Exception as e:
        return {"error": str(e)}

@app.delete("/game-mode/delete/{db_session}/{game_mode_id}")
# This endpoint deletes a game mode based on its id.
async def delete_game_mode(db_session: Session, game_mode_id: int):
    try:
        GameModeCrud.delete_game_mode(db_session, game_mode_id)
        return {"message": "successfully deleted game mode"}
    except Exception as e:
        return {"error": str(e)}
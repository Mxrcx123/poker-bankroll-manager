from fastapi import FastAPI
from sqlalchemy.orm import Session
from backend.app.crud.tournamentCrud import TournamentCrud

app = FastAPI()

@app.post("/tournament/{db_session}/{session_id}/{buy_in}")
# This endpoint creates a new tournament in the database.
async def create_tournament(db_session: Session, session_id: int, buy_in: float, fee: float = None, 
                            rebuys: int = 0, rebuy_cost: float = None, add_ons: int = 0,
                            add_on_cost: float = None, winnings: float = 0, finish_position: int = None):
    try:
        TournamentCrud.create_tournament(db_session, session_id, buy_in, fee, rebuys, rebuy_cost, add_ons, add_on_cost, winnings, finish_position)
        return {"message": "Tournament created successfully"}
    except Exception as e:
        return {"error": str(e)}

@app.get("/tournament/{db_session}/{tournament_id}")
# This endpoint returns a tournament based on its id.
async def get_tournament_by_id(db_session: Session, tournament_id: int):
    try:
        tournament = TournamentCrud.get_tournament_by_id(db_session, tournament_id)
        return {
            "message": "successfully got tournament",
            "id": tournament.id,
            "session_id": tournament.session_id,
            "buy_in": tournament.buy_in,
            "fee": tournament.fee,
            "rebuys": tournament.rebuys,
            "rebuy_cost": tournament.rebuy_cost,
            "add_ons": tournament.add_ons,
            "add_on_cost": tournament.add_on_cost,
            "winnings": tournament.winnings,
            "finish_position": tournament.finish_position
        }
    except Exception as e:
        return {"error": str(e)}

@app.get("/tournament/session/{db_session}/{session_id}")
# This endpoint returns a tournament based on its session id.
async def get_tournament_by_session_id(db_session: Session, session_id: int):
    try:
        tournament = TournamentCrud.get_tournament_by_session_id(db_session, session_id)
        return {
            "message": "successfully got tournament",
            "id": tournament.id,
            "session_id": tournament.session_id,
            "buy_in": tournament.buy_in,
            "fee": tournament.fee,
            "rebuys": tournament.rebuys,
            "rebuy_cost": tournament.rebuy_cost,
            "add_ons": tournament.add_ons,
            "add_on_cost": tournament.add_on_cost,
            "winnings": tournament.winnings,
            "finish_position": tournament.finish_position
        }
    except Exception as e:
        return {"error": str(e)}

@app.put("/tournament/{db_session}/{tournament_id}")
# This endpoint updates a tournament based on its id.
async def update_tournament(db_session: Session, tournament_id: int, buy_in: float = None, fee: float = None,
                            rebuys: int = None, rebuy_cost: float = None, add_ons: int = None,
                            add_on_cost: float = None, winnings: float = None, finish_position: int = None):
    try:
        TournamentCrud.update_tournament(db_session, tournament_id, buy_in, fee, rebuys, rebuy_cost, add_ons, add_on_cost, winnings, finish_position)
        return {"message": "successfully updated tournament"}
    except Exception as e:
        return {"error": str(e)}

@app.delete("/tournament/delete/{db_session}/{tournament_id}")
# This endpoint deletes a tournament based on its id.
async def delete_tournament(db_session: Session, tournament_id: int):
    try:
        TournamentCrud.delete_tournament(db_session, tournament_id)
        return {"message": "successfully deleted tournament"}
    except Exception as e:
        return {"error": str(e)}
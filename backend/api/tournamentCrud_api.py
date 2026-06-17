from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from model.base import get_db
from crud.tournamentCrud import TournamentCrud
# Amir

router = APIRouter()

@router.post("/tournament/{session_id}/{buy_in}")
async def create_tournament(session_id: int, buy_in: float, fee: float = None,
                            rebuys: int = 0, rebuy_cost: float = None, add_ons: int = 0,
                            add_on_cost: float = None, winnings: float = 0, finish_position: int = None,
                            db_session: Session = Depends(get_db)):
    try:
        TournamentCrud.create_tournament(db_session, session_id, buy_in, fee, rebuys, rebuy_cost, add_ons, add_on_cost, winnings, finish_position)
        return {"message": "Tournament created successfully"}
    except Exception as e:
        return {"error": str(e)}

@router.get("/tournament/{tournament_id}")
async def get_tournament_by_id(tournament_id: int, db_session: Session = Depends(get_db)):
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

@router.get("/tournament/session/{session_id}")
async def get_tournament_by_session_id(session_id: int, db_session: Session = Depends(get_db)):
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

@router.put("/tournament/{tournament_id}")
async def update_tournament(tournament_id: int, buy_in: float = None, fee: float = None,
                            rebuys: int = None, rebuy_cost: float = None, add_ons: int = None,
                            add_on_cost: float = None, winnings: float = None, finish_position: int = None,
                            db_session: Session = Depends(get_db)):
    try:
        TournamentCrud.update_tournament(db_session, tournament_id, buy_in, fee, rebuys, rebuy_cost, add_ons, add_on_cost, winnings, finish_position)
        return {"message": "successfully updated tournament"}
    except Exception as e:
        return {"error": str(e)}

@router.delete("/tournament/delete/{tournament_id}")
async def delete_tournament(tournament_id: int, db_session: Session = Depends(get_db)):
    try:
        TournamentCrud.delete_tournament(db_session, tournament_id)
        return {"message": "successfully deleted tournament"}
    except Exception as e:
        return {"error": str(e)}  
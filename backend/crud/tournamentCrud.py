from sqlalchemy.orm import Session
from backend.model.tournament import Tournament


class TournamentCrud():
    @staticmethod
    def create_tournament(db: Session, session_id: int, buy_in: float, fee: float = None,
                          rebuys: int = 0, rebuy_cost: float = None, add_ons: int = 0,
                          add_on_cost: float = None, winnings: float = 0, finish_position: int = None):
        new_tournament = Tournament(
            session_id=session_id,
            buy_in=buy_in,
            fee=fee,
            rebuys=rebuys,
            rebuy_cost=rebuy_cost,
            add_ons=add_ons,
            add_on_cost=add_on_cost,
            winnings=winnings,
            finish_position=finish_position
        )
        db.add(new_tournament)
        db.commit()
        db.refresh(new_tournament)
        return new_tournament

    @staticmethod
    def get_tournament_by_id(db: Session, tournament_id: int):
        return db.query(Tournament).filter(Tournament.id == tournament_id).first()

    @staticmethod
    def get_tournament_by_session_id(db: Session, session_id: int):
        return db.query(Tournament).filter(Tournament.session_id == session_id).first()

    @staticmethod
    def update_tournament(db: Session, tournament_id: int, buy_in: float = None, fee: float = None,
                          rebuys: int = None, rebuy_cost: float = None, add_ons: int = None,
                          add_on_cost: float = None, winnings: float = None, finish_position: int = None):
        tournament = db.query(Tournament).filter(Tournament.id == tournament_id).first()
        if not tournament:
            return None
        if buy_in is not None:
            tournament.buy_in = buy_in
        if fee is not None:
            tournament.fee = fee
        if rebuys is not None:
            tournament.rebuys = rebuys
        if rebuy_cost is not None:
            tournament.rebuy_cost = rebuy_cost
        if add_ons is not None:
            tournament.add_ons = add_ons
        if add_on_cost is not None:
            tournament.add_on_cost = add_on_cost
        if winnings is not None:
            tournament.winnings = winnings
        if finish_position is not None:
            tournament.finish_position = finish_position
        db.commit()
        db.refresh(tournament)
        return tournament

    @staticmethod
    def delete_tournament(db: Session, tournament_id: int):
        tournament = db.query(Tournament).filter(Tournament.id == tournament_id).first()
        if tournament:
            db.delete(tournament)
            db.commit()
        return tournament

from decimal import Decimal

from schema.tournament import TournamentCreate, TournamentResponse, TournamentUpdate


def test_tournament_schemas_validate_and_serialize(tournament):
    create_schema = TournamentCreate(session_id=1, buy_in="50.00", fee="5.00", winnings="100.00")
    update_schema = TournamentUpdate(rebuys=1, winnings="125.00")
    response_schema = TournamentResponse.model_validate(tournament)

    assert create_schema.buy_in == Decimal("50.00")
    assert update_schema.winnings == Decimal("125.00")
    assert response_schema.id == tournament.id
    assert response_schema.finish_position == 3

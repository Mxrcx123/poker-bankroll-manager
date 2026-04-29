from decimal import Decimal

from crud.tournamentCrud import TournamentCrud


def test_tournament_crud_lifecycle(db_session, session_record):
    created = TournamentCrud.create_tournament(
        db_session,
        session_record.id,
        buy_in=50,
        fee=5,
        winnings=100,
        finish_position=2,
    )

    fetched = TournamentCrud.get_tournament_by_id(db_session, created.id)
    by_session = TournamentCrud.get_tournament_by_session_id(db_session, session_record.id)
    updated = TournamentCrud.update_tournament(
        db_session,
        created.id,
        rebuys=1,
        rebuy_cost=50,
        add_ons=1,
        add_on_cost=25,
        winnings=125,
    )
    deleted = TournamentCrud.delete_tournament(db_session, created.id)

    assert fetched.id == created.id
    assert by_session.id == created.id
    assert updated.rebuys == 1
    assert updated.rebuy_cost == Decimal("50.00")
    assert updated.add_ons == 1
    assert updated.add_on_cost == Decimal("25.00")
    assert updated.winnings == Decimal("125.00")
    assert deleted.id == created.id
    assert TournamentCrud.get_tournament_by_id(db_session, created.id) is None


def test_tournament_update_missing_record_returns_none(db_session):
    assert TournamentCrud.update_tournament(db_session, 999, winnings=10) is None

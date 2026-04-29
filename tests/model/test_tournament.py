from sqlalchemy import inspect

from model.tournament import Tournament


def test_tournament_model_columns_and_relationships():
    mapper = inspect(Tournament)

    assert Tournament.__tablename__ == "tournaments"
    assert mapper.columns["session_id"].nullable is False
    assert mapper.columns["session_id"].unique is True
    assert mapper.columns["winnings"].nullable is False
    assert "session" in mapper.relationships.keys()

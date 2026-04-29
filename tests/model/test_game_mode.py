from sqlalchemy import inspect

from model.game_mode import GameMode


def test_game_mode_model_columns_and_relationships():
    mapper = inspect(GameMode)

    assert GameMode.__tablename__ == "game_modes"
    assert mapper.columns["title"].nullable is False
    assert mapper.columns["title"].unique is True
    assert "sessions" in mapper.relationships.keys()

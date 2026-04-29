from schema.game_mode import GameModeCreate, GameModeResponse, GameModeUpdate


def test_game_mode_schemas_validate_and_serialize(game_mode):
    create_schema = GameModeCreate(title="Cash")
    update_schema = GameModeUpdate(title="MTT")
    response_schema = GameModeResponse.model_validate(game_mode)

    assert create_schema.title == "Cash"
    assert update_schema.title == "MTT"
    assert response_schema.id == game_mode.id
    assert response_schema.title == "Cash"

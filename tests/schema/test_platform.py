from schema.platform import PlatformCreate, PlatformResponse, PlatformUpdate


def test_platform_schemas_validate_and_serialize(platform):
    create_schema = PlatformCreate(name="PokerStars")
    update_schema = PlatformUpdate(name="GG Poker")
    response_schema = PlatformResponse.model_validate(platform)

    assert create_schema.name == "PokerStars"
    assert update_schema.name == "GG Poker"
    assert response_schema.id == platform.id
    assert response_schema.name == "PokerStars"

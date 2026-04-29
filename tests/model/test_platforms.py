from sqlalchemy import inspect

from model.platforms import Platform


def test_platform_model_columns_and_relationships():
    mapper = inspect(Platform)

    assert Platform.__tablename__ == "platforms"
    assert mapper.columns["name"].nullable is False
    assert mapper.columns["name"].unique is True
    assert "sessions" in mapper.relationships.keys()

from crud.platformCrud import PlatformCrud


def test_platform_crud_lifecycle(db_session):
    created = PlatformCrud.create_platform(db_session, "PokerStars")

    fetched = PlatformCrud.get_platform_by_id(db_session, created.id)
    by_name = PlatformCrud.get_platform_by_name(db_session, "PokerStars")
    all_platforms = PlatformCrud.get_all_platforms(db_session)
    updated = PlatformCrud.update_platform(db_session, created.id, name="GG Poker")
    deleted = PlatformCrud.delete_platform(db_session, created.id)

    assert fetched.id == created.id
    assert by_name.id == created.id
    assert [platform.id for platform in all_platforms] == [created.id]
    assert updated.name == "GG Poker"
    assert deleted.id == created.id
    assert PlatformCrud.get_platform_by_id(db_session, created.id) is None


def test_platform_update_missing_record_returns_none(db_session):
    assert PlatformCrud.update_platform(db_session, 999, name="888poker") is None

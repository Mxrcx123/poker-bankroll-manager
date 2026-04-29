from crud.gameModeCrud import GameModeCrud


def test_game_mode_crud_lifecycle(db_session):
    created = GameModeCrud.create_game_mode(db_session, "Spin & Go")

    fetched = GameModeCrud.get_game_mode_by_id(db_session, created.id)
    by_title = GameModeCrud.get_game_mode_by_title(db_session, "Spin & Go")
    all_modes = GameModeCrud.get_all_game_modes(db_session)
    updated = GameModeCrud.update_game_mode(db_session, created.id, title="MTT")
    deleted = GameModeCrud.delete_game_mode(db_session, created.id)

    assert fetched.id == created.id
    assert by_title.id == created.id
    assert [mode.id for mode in all_modes] == [created.id]
    assert updated.title == "MTT"
    assert deleted.id == created.id
    assert GameModeCrud.get_game_mode_by_id(db_session, created.id) is None


def test_game_mode_update_missing_record_returns_none(db_session):
    assert GameModeCrud.update_game_mode(db_session, 999, title="Heads-Up") is None

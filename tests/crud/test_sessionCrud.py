from crud.sessionCrud import SessionCrud


def test_session_crud_lifecycle(db_session, user, game_mode, platform):
    created = SessionCrud.create_session(db_session, user.id, game_mode.id, platform.id, "First notes")

    fetched = SessionCrud.get_session_by_id(db_session, created.id)
    by_user = SessionCrud.get_sessions_by_user_id(db_session, user.id)
    by_game_mode = SessionCrud.get_sessions_by_game_mode_id(db_session, game_mode.id)
    by_platform = SessionCrud.get_sessions_by_platform_id(db_session, platform.id)
    updated = SessionCrud.update_session(db_session, created.id, notes="Updated notes")
    deleted = SessionCrud.delete_session(db_session, created.id)

    assert fetched.id == created.id
    assert [session.id for session in by_user] == [created.id]
    assert [session.id for session in by_game_mode] == [created.id]
    assert [session.id for session in by_platform] == [created.id]
    assert updated.notes == "Updated notes"
    assert deleted.id == created.id
    assert SessionCrud.get_session_by_id(db_session, created.id) is None


def test_session_update_missing_record_returns_none(db_session):
    assert SessionCrud.update_session(db_session, 999, notes="Missing") is None

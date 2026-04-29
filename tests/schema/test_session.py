from schema.session import SessionCreate, SessionResponse, SessionUpdate


def test_session_schemas_validate_and_serialize(session_record, aware_datetime):
    create_schema = SessionCreate(user_id=1, game_mode_id=1, platform_id=1, notes="New session")
    update_schema = SessionUpdate(ended_at=aware_datetime, notes="Done")
    response_schema = SessionResponse.model_validate(session_record)

    assert create_schema.notes == "New session"
    assert update_schema.ended_at == aware_datetime
    assert response_schema.id == session_record.id
    assert response_schema.notes == "Opening session"

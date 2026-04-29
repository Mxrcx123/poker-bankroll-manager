import hashlib

from crud.userCrud import UserCrud


def test_user_crud_lifecycle(db_session):
    created = UserCrud.create_user(db_session, "alice", "securepass")

    fetched = UserCrud.get_user_by_id(db_session, created.id)
    by_username = UserCrud.get_user_by_username(db_session, "alice")
    all_users = UserCrud.get_all_users(db_session)
    updated = UserCrud.update_user_by_id(db_session, created.id, new_username="alice2", new_password="newpass123")
    deleted = UserCrud.delete_user_by_id(db_session, created.id)

    assert created.password == hashlib.sha256("securepass".encode()).hexdigest()
    assert fetched.id == created.id
    assert by_username.id == created.id
    assert [user.id for user in all_users] == [created.id]
    assert updated.username == "alice2"
    assert updated.password == hashlib.sha256("newpass123".encode()).hexdigest()
    assert deleted.id == created.id
    assert UserCrud.get_user_by_id(db_session, created.id) is None


def test_user_update_missing_record_returns_none(db_session):
    assert UserCrud.update_user_by_id(db_session, 999, new_username="ghost") is None

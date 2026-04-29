import pytest
from pydantic import ValidationError

from schema.user import UserCreate, UserResponse, UserUpdate


def test_user_create_enforces_password_length():
    with pytest.raises(ValidationError):
        UserCreate(username="short", password="123")


def test_user_schemas_validate_and_serialize(user):
    update_schema = UserUpdate(username="alice2", password="newpassword")
    response_schema = UserResponse.model_validate(user)

    assert update_schema.username == "alice2"
    assert response_schema.id == user.id
    assert response_schema.username == "alice"

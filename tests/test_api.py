# from backend.app.Api import api
import requests
import json
base_url = "http://localhost:8000"

# This test checks if the root endpoint of the API works
def test_root():
    response = json.loads(requests.get(f"{base_url}/").content)
    assert "Backend connection Works" == response["message"]

# This test checks if the create_user endpoint of the API works 
def test_create_user():
    response = json.loads(requests.post(f"{base_url}/user/testdb/testuser/testpassword").content)
    assert "User created successfully" == response["message"]

# This test checks if the get_user_by_id endpoint of the API works
def test_get_user_by_id():
    response = json.loads(requests.get(f"{base_url}/user/testdb/1").content)
    assert "successfully got user" == response["message"]
    assert "testuser" == response["name"]

# This test checks if the update_user_by_id endpoint of the API works
def test_update_user_by_id():
    response = json.loads(requests.update(f"{base_url}/user/testdb/1/newtestuser/newtestpassword").content)
    assert "successfully updated user" == response["message"]
import sqlalchemy
from fastapi import FastAPI
from sqlalchemy.orm import Session
from backend.app.crud.userCrud import UserCrud

app = FastAPI()

@app.get("/")
# This endpoint checks if the backend connection is working by returning a simple message.
async def root():
    return {"message": "Backend connection Works"}

@app.post("user/{db_session}/{user_name}/{user_password}")
# This endpoint creates a new user in a database with a name and password.
async def create_user(db_session: Session, user_name, user_password):
    try:
        # Call the create_user function from the Crud module to create a new user in the database.
        UserCrud.create_user(db_session, user_name, user_password)
        return {"message": "User created successfully"}
    except Exception as e:
        return {"error": str(e)}

@app.get("/user/{db_session}/{user_id}")
# This endpoint returns the data of a user based on its id
async def get_user_by_id(db_session: Session, id: int):
    try:
        user = UserCrud.get_user_by_id(db_session, id)
        return {
            "message": "successfully got user",
            "name": f"{user.username}",
            "password_hash": f"{user.password}",
            "created_at": f"{user.created_at}"
        }
    except Exception as e:
        return {"error": str(e)}

@app.update("/user/{db_session}/{user_id}/{new_username}/{new_password}")
# This endpoint changes the values of a user based on its id
async def update_user_by_id(db_session: Session, user_id: int, new_username, new_password):
    try:
        UserCrud.update_user_by_id(db_session, user_id, new_username, new_password)
        return {"message": "successfully updated user"}
    except Exception as e:
        return {"error": str(e)}

@app.delete("/user/delete/{db_session}/{user_id}")
async def delete_user_by_id(db_session: Session, user_id: int):
    try:
        UserCrud.delete_user_by_id(db_session, user_id)
        return {"message": "successfluly deleted user"}
    except Exception as e:
        return {"error": str(e)}
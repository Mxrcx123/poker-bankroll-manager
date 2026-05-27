from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from model.base import get_db
from crud.userCrud import UserCrud

router = APIRouter()

@router.post("/user/{user_name}/{user_password}")
async def create_user(user_name: str, user_password: str, db_session: Session = Depends(get_db)):
    try:
        UserCrud.create_user(db_session, user_name, user_password)
        return {"message": "User created successfully"}
    except Exception as e:
        return {"error": str(e)}

@router.get("/user/{user_id}")
async def get_user_by_id(user_id: int, db_session: Session = Depends(get_db)):
    try:
        user = UserCrud.get_user_by_id(db_session, user_id)
        return {
            "message": "successfully got user",
            "name": f"{user.username}",
            "password_hash": f"{user.password}",
            "created_at": f"{user.created_at}"
        }
    except Exception as e:
        return {"error": str(e)}

@router.put("/user/{user_id}/{new_username}/{new_password}")
async def update_user_by_id(user_id: int, new_username: str, new_password: str, db_session: Session = Depends(get_db)):
    try:
        UserCrud.update_user_by_id(db_session, user_id, new_username, new_password)
        return {"message": "successfully updated user"}
    except Exception as e:
        return {"error": str(e)}

@router.delete("/user/delete/{user_id}")
async def delete_user_by_id(user_id: int, db_session: Session = Depends(get_db)):
    try:
        UserCrud.delete_user_by_id(db_session, user_id)
        return {"message": "successfully deleted user"}
    except Exception as e:
        return {"error": str(e)}
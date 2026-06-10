# Überarbeitet von Andreas Haas & korrigiert
# ÄNDERUNG: balance wird jetzt in allen relevanten Responses zurückgegeben
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from model.base import get_db
from crud.userCrud import UserCrud
import hashlib

router = APIRouter()


class LoginRequest(BaseModel):
    username: str
    password: str


@router.post("/user/{user_name}/{user_password}")
async def create_user(user_name: str, user_password: str, db_session: Session = Depends(get_db)):
    try:
        user = UserCrud.create_user(db_session, user_name, user_password)
        return {
            "message": "User created successfully",
            "id": user.id,
            "balance": float(user.balance or 0)  # NEU: Balance direkt mitgeben
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/user/{user_id}")
async def get_user_by_id(user_id: int, db_session: Session = Depends(get_db)):
    try:
        user = UserCrud.get_user_by_id(db_session, user_id)
        if not user:
            raise HTTPException(status_code=404, detail="User nicht gefunden")
        return {
            "message": "successfully got user",
            "id": user.id,
            "name": user.username,
            "created_at": str(user.created_at),
            "balance": float(user.balance or 0)  # NEU: Balance für Frontend
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/user/{user_id}/{new_username}/{new_password}")
async def update_user_by_id(
    user_id: int, new_username: str, new_password: str,
    db_session: Session = Depends(get_db)
):
    try:
        UserCrud.update_user_by_id(db_session, user_id, new_username, new_password)
        return {"message": "successfully updated user"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.delete("/user/delete/{user_id}")
async def delete_user_by_id(user_id: int, db_session: Session = Depends(get_db)):
    try:
        UserCrud.delete_user_by_id(db_session, user_id)
        return {"message": "successfully deleted user"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/user/login")
async def login(data: LoginRequest, db_session: Session = Depends(get_db)):
    user = UserCrud.get_user_by_username(db_session, data.username)
    if not user:
        raise HTTPException(status_code=401, detail="Benutzername oder Passwort falsch.")

    hashed_password = hashlib.sha256(data.password.encode()).hexdigest()
    if user.password != hashed_password:
        raise HTTPException(status_code=401, detail="Benutzername oder Passwort falsch.")

    return {
        "id":         user.id,
        "username":   user.username,
        "created_at": str(user.created_at),
        "balance":    float(user.balance or 0),  # NEU: Balance für Frontend beim Login
    }

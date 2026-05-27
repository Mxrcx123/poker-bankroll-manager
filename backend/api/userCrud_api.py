# Überarbeitet von Andreas Haas & korrigiert
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

# ─────────────────────────────────────────────────────────────────────────────
# Endpoints mit korrekter Fehlerbehandlung (HTTPException statt Return)
# ─────────────────────────────────────────────────────────────────────────────

@router.post("/user/{user_name}/{user_password}")
async def create_user(user_name: str, user_password: str, db_session: Session = Depends(get_db)):
    try:
        user = UserCrud.create_user(db_session, user_name, user_password)
        return {"message": "User created successfully", "id": user.id}
    except Exception as e:
        # Wirft jetzt einen echten 400 Bad Request Fehler, den das Frontend sieht!
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/user/{user_id}")
async def get_user_by_id(user_id: int, db_session: Session = Depends(get_db)):
    try:
        user = UserCrud.get_user_by_id(db_session, user_id)
        if not user:
            raise HTTPException(status_code=404, detail="User nicht gefunden")
        return {
            "message": "successfully got user",
            "name": f"{user.username}",
            "password_hash": f"{user.password}",
            "created_at": f"{user.created_at}"
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/user/{user_id}/{new_username}/{new_password}")
async def update_user_by_id(user_id: int, new_username: str, new_password: str, db_session: Session = Depends(get_db)):
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

# ─────────────────────────────────────────────────────────────────────────────
# Login-Endpoint
# ─────────────────────────────────────────────────────────────────────────────

@router.post("/user/login")
async def login(data: LoginRequest, db_session: Session = Depends(get_db)):
    user = UserCrud.get_user_by_username(db_session, data.username)
    if not user:
        raise HTTPException(status_code=401, detail="Benutzername oder Passwort falsch.")

    # Das eingegebene Passwort hashen, um es mit der DB vergleichen zu können:
    hashed_password = hashlib.sha256(data.password.encode()).hexdigest()

    if user.password != hashed_password:
        raise HTTPException(status_code=401, detail="Benutzername oder Passwort falsch.")

    return {
        "id":         user.id,
        "username":   user.username,
        "created_at": str(user.created_at),
    }
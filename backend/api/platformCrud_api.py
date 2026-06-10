from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from model.base import get_db
from crud.platformCrud import PlatformCrud

router = APIRouter()

@router.post("/platform/{name}")
# This endpoint creates a new platform in the database.
async def create_platform(name: str, db_session: Session = Depends(get_db)):
    try:
        PlatformCrud.create_platform(db_session, name)
        return {"message": "Platform created successfully"}
    except Exception as e:
        return {"error": str(e)}

@router.get("/platform/{platform_id}")
# This endpoint returns a platform based on its id.
async def get_platform_by_id(platform_id: int, db_session: Session = Depends(get_db)):
    try:
        platform = PlatformCrud.get_platform_by_id(db_session, platform_id)
        return {
            "message": "successfully got platform",
            "id": platform.id,
            "name": platform.name
        }
    except Exception as e:
        return {"error": str(e)}

@router.get("/platform/name/{name}")
# This endpoint returns a platform based on its name.
async def get_platform_by_name(name: str, db_session: Session = Depends(get_db)):
    try:
        platform = PlatformCrud.get_platform_by_name(db_session, name)
        return {
            "message": "successfully got platform",
            "id": platform.id,
            "name": platform.name
        }
    except Exception as e:
        return {"error": str(e)}

@router.get("/platform/all" )
# This endpoint returns all platforms.
async def get_all_platforms(db_session: Session = Depends(get_db)):
    try:
        platforms = PlatformCrud.get_all_platforms(db_session)
        return {
            "message": "successfully got all platforms",
            "platforms": [{"id": p.id, "name": p.name} for p in platforms]
        }
    except Exception as e:
        return {"error": str(e)}

@router.put("/platform/{platform_id}")
# This endpoint updates a platform based on its id.
async def update_platform(platform_id: int, name: str = None, db_session: Session = Depends(get_db)):
    try:
        PlatformCrud.update_platform(db_session, platform_id, name)
        return {"message": "successfully updated platform"}
    except Exception as e:
        return {"error": str(e)}

@router.delete("/platform/delete/{platform_id}")
# This endpoint deletes a platform based on its id.
async def delete_platform(platform_id: int, db_session: Session = Depends(get_db)):
    try:
        PlatformCrud.delete_platform(db_session, platform_id)
        return {"message": "successfully deleted platform"}
    except Exception as e:
        return {"error": str(e)}
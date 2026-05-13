from fastapi import FastAPI
from sqlalchemy.orm import Session
from crud.platformCrud import PlatformCrud

app = FastAPI()

@app.post("/platform/{db_session}/{name}")
# This endpoint creates a new platform in the database.
async def create_platform(db_session: Session, name: str):
    try:
        PlatformCrud.create_platform(db_session, name)
        return {"message": "Platform created successfully"}
    except Exception as e:
        return {"error": str(e)}

@app.get("/platform/{db_session}/{platform_id}")
# This endpoint returns a platform based on its id.
async def get_platform_by_id(db_session: Session, platform_id: int):
    try:
        platform = PlatformCrud.get_platform_by_id(db_session, platform_id)
        return {
            "message": "successfully got platform",
            "id": platform.id,
            "name": platform.name
        }
    except Exception as e:
        return {"error": str(e)}

@app.get("/platform/name/{db_session}/{name}")
# This endpoint returns a platform based on its name.
async def get_platform_by_name(db_session: Session, name: str):
    try:
        platform = PlatformCrud.get_platform_by_name(db_session, name)
        return {
            "message": "successfully got platform",
            "id": platform.id,
            "name": platform.name
        }
    except Exception as e:
        return {"error": str(e)}

@app.get("/platform/all/{db_session}")
# This endpoint returns all platforms.
async def get_all_platforms(db_session: Session):
    try:
        platforms = PlatformCrud.get_all_platforms(db_session)
        return {
            "message": "successfully got all platforms",
            "platforms": [{"id": p.id, "name": p.name} for p in platforms]
        }
    except Exception as e:
        return {"error": str(e)}

@app.put("/platform/{db_session}/{platform_id}")
# This endpoint updates a platform based on its id.
async def update_platform(db_session: Session, platform_id: int, name: str = None):
    try:
        PlatformCrud.update_platform(db_session, platform_id, name)
        return {"message": "successfully updated platform"}
    except Exception as e:
        return {"error": str(e)}

@app.delete("/platform/delete/{db_session}/{platform_id}")
# This endpoint deletes a platform based on its id.
async def delete_platform(db_session: Session, platform_id: int):
    try:
        PlatformCrud.delete_platform(db_session, platform_id)
        return {"message": "successfully deleted platform"}
    except Exception as e:
        return {"error": str(e)}
from fastapi import APIRouter

router = APIRouter()

@router.get("/")
# This endpoint checks if the backend connection is working by returning a simple message.
async def root():
    return {"message": "Backend connection Works"}
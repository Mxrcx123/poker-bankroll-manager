from fastapi import FastAPI
from app.api.withdrawal_api import router as withdrawal_router

app = FastAPI(title="Poker Bankroll Manager API")

app.include_router(withdrawal_router)
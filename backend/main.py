#Überarbeitet von Andreas Haas

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from db.init_db import init_db
import model  # Sicherstellen, dass alle Models geladen sind, bevor init_db() aufgerufen wird

# Importiere alle Router – Pfad anpassen je nach Ordnerstruktur!
from api.check_api_connection import router as check_router
from api.userCrud_api import router as user_router
from api.sessionCrud_api import router as session_router
from api.cashSessionCrud_api import router as cash_session_router
from api.tournamentCrud_api import router as tournament_router
from api.gameModeCrud_api import router as game_mode_router
from api.platformCrud_api import router as platform_router
from api.bankrollEventCrud_api import router as bankroll_event_router
from api.bankrollSnapshotCrud_api import router as bankroll_snapshot_router
from api.deposit_api import router as deposit_router
from api.withdrawal_api import router as withdrawal_router

try:
    init_db()
except Exception as e:
    print(f"Warning: Could not initialize database: {e}")

app = FastAPI(
    title="Poker Bankroll Manager API",
    description="API for managing poker bankroll, sessions, and statistics",
    version="1.0.0"
)
app.include_router(withdrawal_api.router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Router einbinden
app.include_router(check_router)
app.include_router(user_router)
app.include_router(session_router)
app.include_router(cash_session_router)
app.include_router(tournament_router)
app.include_router(game_mode_router)
app.include_router(platform_router)
app.include_router(bankroll_event_router)
app.include_router(bankroll_snapshot_router)
app.include_router(deposit_router)
app.include_router(withdrawal_router)

@app.get("/health")
def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
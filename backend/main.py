from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from db.init_db import init_db

# Initialize database
try:
    init_db()
except Exception as e:
    print(f"Warning: Could not initialize database: {e}")

# Create FastAPI app
app = FastAPI(
    title="Poker Bankroll Manager API",
    description="API for managing poker bankroll, sessions, and statistics",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, restrict this to specific domains
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def read_root():
    """Root endpoint"""
    return {"message": "Poker Bankroll Manager API", "version": "1.0.0"}


@app.get("/health")
def health_check():
    """Health check endpoint"""
    return {"status": "healthy"}


# Routes will be imported here
# from app.routes import users, sessions, cash_sessions, tournaments, game_modes, platforms, bankroll_events, bankroll_snapshots


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

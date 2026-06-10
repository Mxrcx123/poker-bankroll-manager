from model.base import Base, engine
import model  # Import all models so metadata knows about them

def init_db():
    """Initialize database by creating all tables"""
    Base.metadata.create_all(bind=engine)

if __name__ == "__main__":
    print("Creating database tables...")
    init_db()
    print("Database initialized successfully!")

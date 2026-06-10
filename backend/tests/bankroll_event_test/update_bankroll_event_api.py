import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session

from model.base import Base
from model.bankroll_events import BankrollEvent
from model.user import User
from api.bankrollEventCrud_api import app
from crud.bankrollEventCrud import BankrollEventCrud

# Test für User Story 4: Edit Bankroll Event
# Autor: Katharina Almer

# Fixture für Test-Datenbank
@pytest.fixture
def test_db():
    """Erstellt eine In-Memory SQLite Datenbank für Tests"""
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(engine)
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = TestingSessionLocal()
    yield db
    db.close()


@pytest.fixture
def client():
    """Erstellt einen TestClient für FastAPI"""
    return TestClient(app)


@pytest.fixture
def test_user(test_db: Session):
    """Erstellt einen Test-Benutzer"""
    user = User(username="testuser", password="testpassword")
    test_db.add(user)
    test_db.commit()
    test_db.refresh(user)
    return user


@pytest.fixture
def bankroll_event(test_db: Session, test_user: User):
    """Erstellt ein Test-Bankroll-Event"""
    event = BankrollEvent(
        user_id=test_user.id,
        amount=100.50,
        event_type="deposit",
        notes="Initial deposit"
    )
    test_db.add(event)
    test_db.commit()
    test_db.refresh(event)
    return event


class TestUpdateBankrollEventAPI:
    """Testkasse für die Update Bankroll Event API Endpoint"""

    def test_update_bankroll_event_amount(self, client: TestClient, test_db: Session, bankroll_event: BankrollEvent):
        """Test: Update Amount über API"""
        response = client.put(
            f"/bankroll-event/{id(test_db)}/{bankroll_event.id}?amount=250.75"
        )
        
        assert response.status_code == 200
        assert response.json()["message"] == "successfully updated bankroll event"
        
        # Überprüfe, dass der Betrag in der DB aktualisiert wurde
        updated_event = BankrollEventCrud.get_bankroll_event_by_id(test_db, bankroll_event.id)
        assert updated_event.amount == 250.75

    def test_update_bankroll_event_multiple_fields(self, client: TestClient, test_db: Session, bankroll_event: BankrollEvent):
        """Test: Update mehrerer Felder über API"""
        response = client.put(
            f"/bankroll-event/{id(test_db)}/{bankroll_event.id}",
            params={
                "amount": 500.00,
                "event_type": "bonus",
                "notes": "Tournament bonus"
            }
        )
        
        assert response.status_code == 200
        assert response.json()["message"] == "successfully updated bankroll event"
        
        # Überprüfe die DB
        updated_event = BankrollEventCrud.get_bankroll_event_by_id(test_db, bankroll_event.id)
        assert updated_event.amount == 500.00
        assert updated_event.event_type == "bonus"
        assert updated_event.notes == "Tournament bonus"

    def test_update_bankroll_event_nonexistent(self, client: TestClient, test_db: Session):
        """Test: Update für nicht existierendes Event"""
        response = client.put(
            f"/bankroll-event/{id(test_db)}/999?amount=100.00"
        )
        
        assert response.status_code == 200
        # API gibt Fehlermeldung zurück oder erfolgreich, aber keine Änderung

    def test_update_bankroll_event_only_event_type(self, client: TestClient, test_db: Session, bankroll_event: BankrollEvent):
        """Test: Update nur des Event-Typs über API"""
        response = client.put(
            f"/bankroll-event/{id(test_db)}/{bankroll_event.id}?event_type=withdrawal"
        )
        
        assert response.status_code == 200
        assert response.json()["message"] == "successfully updated bankroll event"
        
        # Überprüfe die DB
        updated_event = BankrollEventCrud.get_bankroll_event_by_id(test_db, bankroll_event.id)
        assert updated_event.event_type == "withdrawal"
        assert updated_event.amount == 100.50  # Betrag sollte gleich sein

    def test_update_bankroll_event_response_format(self, client: TestClient, test_db: Session, bankroll_event: BankrollEvent):
        """Test: API Response Format ist korrekt"""
        response = client.put(
            f"/bankroll-event/{id(test_db)}/{bankroll_event.id}?amount=333.33&notes=Updated"
        )
        
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        assert data["message"] == "successfully updated bankroll event"
        assert "error" not in data

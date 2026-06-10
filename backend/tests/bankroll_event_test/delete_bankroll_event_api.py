import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session

from model.base import Base
from model.bankroll_events import BankrollEvent
from model.user import User
from api.bankrollEventCrud_api import app
from crud.bankrollEventCrud import BankrollEventCrud


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
        amount=100.00,
        event_type="deposit",
        notes="Initial deposit"
    )
    test_db.add(event)
    test_db.commit()
    test_db.refresh(event)
    return event


class TestDeleteBankrollEventAPI:
    """Testfälle für den Delete Bankroll Event API-Endpunkt"""

    def test_delete_existing_bankroll_event(self, client: TestClient, test_db: Session, bankroll_event: BankrollEvent):
        response = client.delete(f"/bankroll-event/delete/{id(test_db)}/{bankroll_event.id}")

        assert response.status_code == 200
        assert response.json()["message"] == "successfully deleted bankroll event"
        assert BankrollEventCrud.get_bankroll_event_by_id(test_db, bankroll_event.id) is None

    def test_delete_nonexistent_bankroll_event(self, client: TestClient, test_db: Session):
        response = client.delete(f"/bankroll-event/delete/{id(test_db)}/999")

        assert response.status_code == 200
        assert response.json()["message"] == "successfully deleted bankroll event"

    def test_delete_does_not_remove_other_events(self, client: TestClient, test_db: Session, test_user: User):
        event1 = BankrollEvent(
            user_id=test_user.id,
            amount=50.00,
            event_type="deposit",
            notes="First deposit"
        )
        event2 = BankrollEvent(
            user_id=test_user.id,
            amount=75.00,
            event_type="withdrawal",
            notes="Second event"
        )
        test_db.add_all([event1, event2])
        test_db.commit()
        test_db.refresh(event1)
        test_db.refresh(event2)

        response = client.delete(f"/bankroll-event/delete/{id(test_db)}/{event1.id}")

        assert response.status_code == 200
        assert response.json()["message"] == "successfully deleted bankroll event"
        assert BankrollEventCrud.get_bankroll_event_by_id(test_db, event1.id) is None
        assert BankrollEventCrud.get_bankroll_event_by_id(test_db, event2.id) is not None

    def test_delete_response_format(self, client: TestClient, test_db: Session, bankroll_event: BankrollEvent):
        response = client.delete(f"/bankroll-event/delete/{id(test_db)}/{bankroll_event.id}")

        data = response.json()
        assert "message" in data
        assert data["message"] == "successfully deleted bankroll event"
        assert "error" not in data

    def test_delete_twice_returns_success(self, client: TestClient, test_db: Session, bankroll_event: BankrollEvent):
        response1 = client.delete(f"/bankroll-event/delete/{id(test_db)}/{bankroll_event.id}")
        response2 = client.delete(f"/bankroll-event/delete/{id(test_db)}/{bankroll_event.id}")

        assert response1.status_code == 200
        assert response1.json()["message"] == "successfully deleted bankroll event"
        assert response2.status_code == 200
        assert response2.json()["message"] == "successfully deleted bankroll event"
        assert BankrollEventCrud.get_bankroll_event_by_id(test_db, bankroll_event.id) is None

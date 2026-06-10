import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session

from model.base import Base
from model.bankroll_events import BankrollEvent
from model.user import User
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


class TestUpdateBankrollEvent:
    """Testkasse für die update_bankroll_event Funktion"""

    def test_update_amount(self, test_db: Session, bankroll_event: BankrollEvent):
        """Test: Amount aktualisieren"""
        new_amount = 250.75
        
        updated_event = BankrollEventCrud.update_bankroll_event(
            test_db,
            bankroll_event.id,
            amount=new_amount
        )
        
        assert updated_event is not None
        assert updated_event.amount == new_amount
        assert updated_event.event_type == "deposit"

    def test_update_multiple_fields(self, test_db: Session, bankroll_event: BankrollEvent):
        """Test: Mehrere Felder gleichzeitig aktualisieren"""
        new_amount = 500.00
        new_event_type = "bonus"
        new_notes = "Bonus from tournament"
        
        updated_event = BankrollEventCrud.update_bankroll_event(
            test_db,
            bankroll_event.id,
            amount=new_amount,
            event_type=new_event_type,
            notes=new_notes
        )
        
        assert updated_event is not None
        assert updated_event.amount == new_amount
        assert updated_event.event_type == new_event_type
        assert updated_event.notes == new_notes

    def test_update_nonexistent_event(self, test_db: Session):
        """Test: Nicht existierendes Event zurückgeben None"""
        updated_event = BankrollEventCrud.update_bankroll_event(
            test_db,
            event_id=999,
            amount=100.00
        )
        
        assert updated_event is None

    def test_update_persistence_to_database(self, test_db: Session, bankroll_event: BankrollEvent):
        """Test: Änderungen werden in der Datenbank persistiert"""
        new_amount = 333.33
        
        BankrollEventCrud.update_bankroll_event(
            test_db,
            bankroll_event.id,
            amount=new_amount
        )
        
        retrieved_event = BankrollEventCrud.get_bankroll_event_by_id(test_db, bankroll_event.id)
        
        assert retrieved_event is not None
        assert retrieved_event.amount == new_amount

    def test_update_preserves_user_id_and_occurred_at(self, test_db: Session, bankroll_event: BankrollEvent, test_user: User):
        """Test: user_id und occurred_at bleiben unverändert"""
        original_user_id = bankroll_event.user_id
        original_occurred_at = bankroll_event.occurred_at
        
        updated_event = BankrollEventCrud.update_bankroll_event(
            test_db,
            bankroll_event.id,
            amount=999.99,
            event_type="test",
            notes="test note"
        )
        
        assert updated_event.user_id == original_user_id
        assert updated_event.occurred_at == original_occurred_at

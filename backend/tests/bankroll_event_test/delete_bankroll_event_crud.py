import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session

from model.base import Base
from model.bankroll_events import BankrollEvent
from model.user import User
from crud.bankrollEventCrud import BankrollEventCrud

# Test für User Story 5: Delete Bankroll Event
# Autor: Katharina Almer


@pytest.fixture
def test_db():
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(engine)
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = TestingSessionLocal()
    yield db
    db.close()


@pytest.fixture
def test_user(test_db: Session):
    user = User(username="testuser", password="testpassword")
    test_db.add(user)
    test_db.commit()
    test_db.refresh(user)
    return user


@pytest.fixture
def bankroll_event(test_db: Session, test_user: User):
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


class TestDeleteBankrollEventCrud:
    def test_delete_existing_event(self, test_db: Session, bankroll_event: BankrollEvent):
        deleted_event = BankrollEventCrud.delete_bankroll_event(test_db, bankroll_event.id)

        assert deleted_event is not None
        assert deleted_event.id == bankroll_event.id
        assert BankrollEventCrud.get_bankroll_event_by_id(test_db, bankroll_event.id) is None

    def test_delete_nonexistent_event_returns_none(self, test_db: Session):
        result = BankrollEventCrud.delete_bankroll_event(test_db, event_id=999)

        assert result is None

    def test_delete_does_not_remove_other_events(self, test_db: Session, test_user: User):
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

        deleted_event = BankrollEventCrud.delete_bankroll_event(test_db, event1.id)

        assert deleted_event is not None
        assert deleted_event.id == event1.id
        assert BankrollEventCrud.get_bankroll_event_by_id(test_db, event1.id) is None
        assert BankrollEventCrud.get_bankroll_event_by_id(test_db, event2.id) is not None

    def test_delete_persists_after_commit(self, test_db: Session, bankroll_event: BankrollEvent):
        BankrollEventCrud.delete_bankroll_event(test_db, bankroll_event.id)

        retrieved = test_db.query(BankrollEvent).filter(BankrollEvent.id == bankroll_event.id).first()
        assert retrieved is None

    def test_delete_returns_correct_object_type(self, test_db: Session, bankroll_event: BankrollEvent):
        deleted_event = BankrollEventCrud.delete_bankroll_event(test_db, bankroll_event.id)

        assert isinstance(deleted_event, BankrollEvent)
        assert deleted_event.user_id == bankroll_event.user_id
        assert deleted_event.event_type == bankroll_event.event_type

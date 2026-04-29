from datetime import datetime, timezone
from decimal import Decimal
from pathlib import Path
import sys

import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker


REPO_ROOT = Path(__file__).resolve().parents[1]
BACKEND_ROOT = REPO_ROOT / "backend"

if str(BACKEND_ROOT) not in sys.path:
    sys.path.insert(0, str(BACKEND_ROOT))

from model.base import Base
from model.user import User
from model.game_mode import GameMode
from model.platforms import Platform
from model.Session import Session
from model.cash_session import CashSession
from model.tournament import Tournament
from model.bankroll_events import BankrollEvent
from model.bankroll_snapshot import BankrollSnapshot
from crud.withdrawal_crud import db_withdrawals


@pytest.fixture()
def db_session():
    engine = create_engine("sqlite:///:memory:")
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()
        Base.metadata.drop_all(bind=engine)


@pytest.fixture()
def user(db_session):
    record = User(username="alice", password="hashed")
    db_session.add(record)
    db_session.commit()
    db_session.refresh(record)
    return record


@pytest.fixture()
def second_user(db_session):
    record = User(username="bob", password="hashed")
    db_session.add(record)
    db_session.commit()
    db_session.refresh(record)
    return record


@pytest.fixture()
def game_mode(db_session):
    record = GameMode(title="Cash")
    db_session.add(record)
    db_session.commit()
    db_session.refresh(record)
    return record


@pytest.fixture()
def platform(db_session):
    record = Platform(name="PokerStars")
    db_session.add(record)
    db_session.commit()
    db_session.refresh(record)
    return record


@pytest.fixture()
def session_record(db_session, user, game_mode, platform):
    record = Session(
        user_id=user.id,
        game_mode_id=game_mode.id,
        platform_id=platform.id,
        notes="Opening session",
    )
    db_session.add(record)
    db_session.commit()
    db_session.refresh(record)
    return record


@pytest.fixture()
def cash_session(db_session, session_record):
    record = CashSession(session_id=session_record.id, buy_in=Decimal("100.00"), cash_out=Decimal("150.00"))
    db_session.add(record)
    db_session.commit()
    db_session.refresh(record)
    return record


@pytest.fixture()
def tournament(db_session, session_record):
    record = Tournament(
        session_id=session_record.id,
        buy_in=Decimal("50.00"),
        fee=Decimal("5.00"),
        winnings=Decimal("120.00"),
        finish_position=3,
    )
    db_session.add(record)
    db_session.commit()
    db_session.refresh(record)
    return record


@pytest.fixture()
def bankroll_event(db_session, user):
    record = BankrollEvent(
        user_id=user.id,
        amount=Decimal("25.00"),
        event_type="deposit",
        notes="Initial deposit",
    )
    db_session.add(record)
    db_session.commit()
    db_session.refresh(record)
    return record


@pytest.fixture()
def bankroll_snapshot(db_session, user):
    record = BankrollSnapshot(user_id=user.id, amount=Decimal("500.00"))
    db_session.add(record)
    db_session.commit()
    db_session.refresh(record)
    return record


@pytest.fixture(autouse=True)
def clear_withdrawals():
    db_withdrawals.clear()
    yield
    db_withdrawals.clear()


@pytest.fixture()
def aware_datetime():
    return datetime(2026, 4, 8, 12, 0, tzinfo=timezone.utc)

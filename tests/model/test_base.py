from datetime import timezone

from model import base


def test_now_returns_timezone_aware_utc_datetime():
    current = base.now()

    assert current.tzinfo is not None
    assert current.tzinfo.utcoffset(current) == timezone.utc.utcoffset(current)


def test_get_db_yields_session_and_closes_it(monkeypatch):
    class DummySession:
        def __init__(self):
            self.closed = False

        def close(self):
            self.closed = True

    session = DummySession()
    monkeypatch.setattr(base, "SessionLocal", lambda: session)

    generator = base.get_db()
    yielded = next(generator)

    assert yielded is session

    try:
        next(generator)
    except StopIteration:
        pass

    assert session.closed is True

from schema import (
    BankrollEventCreate,
    BankrollEventResponse,
    BankrollEventUpdate,
    BankrollSnapshotCreate,
    BankrollSnapshotResponse,
    BankrollSnapshotUpdate,
    CashSessionCreate,
    CashSessionResponse,
    CashSessionUpdate,
    GameModeCreate,
    GameModeResponse,
    GameModeUpdate,
    PlatformCreate,
    PlatformResponse,
    PlatformUpdate,
    SessionCreate,
    SessionResponse,
    SessionUpdate,
    TournamentCreate,
    TournamentResponse,
    TournamentUpdate,
    UserCreate,
    UserResponse,
    UserUpdate,
)


def test_schema_package_exports_expected_symbols():
    assert UserCreate.__name__ == "UserCreate"
    assert UserResponse.__name__ == "UserResponse"
    assert UserUpdate.__name__ == "UserUpdate"
    assert SessionCreate.__name__ == "SessionCreate"
    assert SessionResponse.__name__ == "SessionResponse"
    assert SessionUpdate.__name__ == "SessionUpdate"
    assert CashSessionCreate.__name__ == "CashSessionCreate"
    assert CashSessionResponse.__name__ == "CashSessionResponse"
    assert CashSessionUpdate.__name__ == "CashSessionUpdate"
    assert TournamentCreate.__name__ == "TournamentCreate"
    assert TournamentResponse.__name__ == "TournamentResponse"
    assert TournamentUpdate.__name__ == "TournamentUpdate"
    assert BankrollEventCreate.__name__ == "BankrollEventCreate"
    assert BankrollEventResponse.__name__ == "BankrollEventResponse"
    assert BankrollEventUpdate.__name__ == "BankrollEventUpdate"
    assert BankrollSnapshotCreate.__name__ == "BankrollSnapshotCreate"
    assert BankrollSnapshotResponse.__name__ == "BankrollSnapshotResponse"
    assert BankrollSnapshotUpdate.__name__ == "BankrollSnapshotUpdate"
    assert GameModeCreate.__name__ == "GameModeCreate"
    assert GameModeResponse.__name__ == "GameModeResponse"
    assert GameModeUpdate.__name__ == "GameModeUpdate"
    assert PlatformCreate.__name__ == "PlatformCreate"
    assert PlatformResponse.__name__ == "PlatformResponse"
    assert PlatformUpdate.__name__ == "PlatformUpdate"

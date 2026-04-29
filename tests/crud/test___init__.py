from crud import (
    BankrollEventCrud,
    BankrollSnapshotCrud,
    CashSessionCrud,
    GameModeCrud,
    PlatformCrud,
    SessionCrud,
    TournamentCrud,
    UserCrud,
)


def test_crud_package_exports_expected_symbols():
    assert BankrollEventCrud.__name__ == "BankrollEventCrud"
    assert BankrollSnapshotCrud.__name__ == "BankrollSnapshotCrud"
    assert CashSessionCrud.__name__ == "CashSessionCrud"
    assert GameModeCrud.__name__ == "GameModeCrud"
    assert PlatformCrud.__name__ == "PlatformCrud"
    assert SessionCrud.__name__ == "SessionCrud"
    assert TournamentCrud.__name__ == "TournamentCrud"
    assert UserCrud.__name__ == "UserCrud"

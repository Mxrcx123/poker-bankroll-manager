from model import (
    BankrollEvent,
    BankrollSnapshot,
    Base,
    CashSession,
    GameMode,
    Platform,
    Session,
    Tournament,
    User,
)


def test_model_package_exports_expected_symbols():
    assert Base is not None
    assert User.__name__ == "User"
    assert Platform.__name__ == "Platform"
    assert GameMode.__name__ == "GameMode"
    assert Session.__name__ == "Session"
    assert CashSession.__name__ == "CashSession"
    assert Tournament.__name__ == "Tournament"
    assert BankrollEvent.__name__ == "BankrollEvent"
    assert BankrollSnapshot.__name__ == "BankrollSnapshot"

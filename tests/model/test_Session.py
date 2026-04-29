from model.Session import Session


def test_session_module_reexports_session_model():
    assert Session.__name__ == "Session"

from decimal import Decimal

from schema.cash_session import CashSessionCreate, CashSessionResponse, CashSessionUpdate


def test_cash_session_schemas_validate_and_serialize(cash_session):
    create_schema = CashSessionCreate(session_id=1, buy_in="100.00", cash_out="120.00")
    update_schema = CashSessionUpdate(cash_out="150.00")
    response_schema = CashSessionResponse.model_validate(cash_session)

    assert create_schema.buy_in == Decimal("100.00")
    assert update_schema.cash_out == Decimal("150.00")
    assert response_schema.id == cash_session.id
    assert response_schema.cash_out == Decimal("150.00")

import pytest
from pydantic import ValidationError
from app.schemas.intent import StructuredIntent

def test_negative_amount_rejected():
    with pytest.raises(ValidationError):
        StructuredIntent(
            action="PURCHASE",
            merchant="Amazon",
            amount_paise=-5000,
            currency="INR"
        )

def test_non_inr_currency_rejected():
    with pytest.raises(ValidationError):
        StructuredIntent(
            action="PURCHASE",
            merchant="Amazon",
            amount_paise=50000,
            currency="USD"
        )

def test_unsupported_action_rejected():
    with pytest.raises(ValidationError):
        StructuredIntent(
            action="UNAUTHORIZED_HACK",  # type: ignore
            merchant="Amazon",
            amount_paise=50000,
            currency="INR"
        )

def test_valid_structured_intent():
    intent = StructuredIntent(
        action="PURCHASE",
        merchant="Flipkart",
        category="electronics",
        amount_paise=199900,  # ₹1,999
        currency="INR",
        purpose="Mechanical Keyboard"
    )
    assert intent.action == "PURCHASE"
    assert intent.amount_paise == 199900
    assert intent.currency == "INR"

import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.database import Base
from app.models.session_key import UserSessionKey
from app.services.browser_automation import BrowserAutomationService
from app.services.ecommerce_service import EcommerceService

@pytest.fixture(scope="module")
def test_db():
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(bind=engine)
    TestingSession = sessionmaker(bind=engine)
    session = TestingSession()
    EcommerceService.ensure_catalog_seeded(session)
    yield session
    session.close()

def test_session_key_registration_zero_passwords(test_db):
    """Verifies that session keys are stored as cookies without passwords."""
    sample_cookies = [
        {"name": "SN", "value": "test_flipkart_session_token_123", "domain": ".flipkart.com", "path": "/"},
        {"name": "TI", "value": "test_tracking_id_456", "domain": ".flipkart.com", "path": "/"}
    ]
    key = BrowserAutomationService.save_session_key(
        db=test_db,
        user_id="user_1",
        merchant="Flipkart",
        session_name="My Flipkart Account",
        cookies=sample_cookies
    )
    assert key.id is not None
    assert key.merchant == "Flipkart"
    assert key.is_active is True
    # Verify no password field exists
    assert not hasattr(key, "password")

    # List keys
    keys = BrowserAutomationService.list_session_keys(test_db, "user_1")
    assert len(keys) >= 1
    assert keys[0]["merchant"] == "Flipkart"
    assert keys[0]["has_cookies"] is True

import asyncio

def test_browser_action_out_of_stock_workflow(test_db):
    """
    Verifies that requesting an out-of-stock item (RTX 5090) schedules cart monitor
    and returns the required notification message.
    """
    result = asyncio.run(BrowserAutomationService.execute_ecommerce_action(
        db=test_db,
        user_id="user_1",
        merchant="Flipkart",
        product_query="NVIDIA RTX 5090"
    ))
    assert result["success"] is True
    assert result["in_stock"] is False
    assert result["status"] == "OUT_OF_STOCK"
    assert "out of stock" in result["message"].lower()
    assert "when it comes in stock i will tell you" in result["message"].lower()

def test_browser_action_in_stock_with_session_key(test_db):
    """
    Verifies that in-stock items (Keychron Keyboard) use the session key,
    prepare checkout, and prompt for OTP confirmation.
    """
    result = asyncio.run(BrowserAutomationService.execute_ecommerce_action(
        db=test_db,
        user_id="user_1",
        merchant="Flipkart",
        product_query="Keychron Keyboard"
    ))
    assert result["success"] is True
    assert result["in_stock"] is True
    assert result["status"] == "CART_ADDED"
    assert result["session_key_used"] is True
    assert "otp" in result["message"].lower()

import hmac
import hashlib
import json
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.database import Base
from app.config import settings
from app.models.financial import Transaction
from app.models.payment_order import PaymentOrder
from app.models.ecommerce import ProductCatalog, StockAlert
from app.services.payment_gateway_service import PaymentGatewayService
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

def test_ecommerce_catalog_seed_and_lookup(test_db):
    """Verifies that authorized e-commerce catalog contains verified products."""
    products = test_db.query(ProductCatalog).all()
    assert len(products) >= 5

    # Lookup Amazon Clean Code Book
    in_stock, prod, status = EcommerceService.check_stock_and_price(test_db, query="Clean Code book", merchant="Amazon")
    assert in_stock is True
    assert prod is not None
    assert prod.price_paise == 45000
    assert prod.merchant == "Amazon"

def test_ecommerce_out_of_stock_detection_and_alert(test_db):
    """Verifies that out-of-stock items trigger cart monitoring alerts."""
    in_stock, prod, status = EcommerceService.check_stock_and_price(test_db, query="RTX 5090", merchant="Flipkart")
    assert in_stock is False
    assert status == "OUT_OF_STOCK"
    assert prod is not None

    alert = EcommerceService.register_stock_alert(
        db=test_db,
        user_id="test_user",
        merchant=prod.merchant,
        product_title=prod.title,
        sku=prod.sku,
        target_price_paise=prod.price_paise
    )
    assert alert.id is not None
    assert alert.status == "ACTIVE"

def test_payment_gateway_order_creation_sandbox(test_db):
    """Verifies that sandbox payment orders are created with unique IDs and idempotency."""
    tx = Transaction(
        id="tx-test-order-1",
        idempotency_key="idemp-test-order-1",
        amount_paise=45000,
        currency="INR",
        status="AUTHORIZED",
        user_id="user_1"
    )
    test_db.add(tx)
    test_db.commit()

    ok, order, msg = PaymentGatewayService.create_order(
        db=test_db,
        transaction_id=tx.id,
        amount_paise=45000,
        idempotency_key="gw-idemp-1"
    )
    assert ok is True
    assert order is not None
    assert order.amount_paise == 45000
    assert order.status == "CREATED"
    assert "order_" in order.provider_order_id

    # Duplicate order creation with same idempotency key must return existing order
    ok2, order2, msg2 = PaymentGatewayService.create_order(
        db=test_db,
        transaction_id=tx.id,
        amount_paise=45000,
        idempotency_key="gw-idemp-1"
    )
    assert ok2 is True
    assert order2.id == order.id

def test_payment_signature_verification():
    """Verifies HMAC-SHA256 signature verification and tamper detection."""
    order_id = "order_sbx_9988776655"
    payment_id = "pay_sbx_1122334455"
    secret = "test_gateway_secret_key"

    expected_sig = hmac.new(
        secret.encode(),
        f"{order_id}|{payment_id}".encode(),
        hashlib.sha256
    ).hexdigest()

    # Valid signature
    valid, msg = PaymentGatewayService.verify_payment_signature(order_id, payment_id, expected_sig, secret=secret)
    assert valid is True
    assert msg == "SIGNATURE_VERIFIED"

    # Tampered signature
    invalid, reason = PaymentGatewayService.verify_payment_signature(order_id, payment_id, "tampered_fake_signature", secret=secret)
    assert invalid is False
    assert reason == "INVALID_SIGNATURE"

def test_signed_webhook_idempotency_and_replay_protection(test_db):
    """Verifies that signed webhook updates order status and rejects duplicates."""
    tx = Transaction(
        id="tx-webhook-test",
        idempotency_key="idemp-wh-tx-1",
        amount_paise=749900,
        currency="INR",
        status="AUTHORIZED",
        user_id="user_1"
    )
    test_db.add(tx)
    test_db.commit()

    ok, order, _ = PaymentGatewayService.create_order(
        db=test_db,
        transaction_id=tx.id,
        amount_paise=749900,
        idempotency_key="gw-idemp-wh"
    )

    webhook_payload = {
        "id": "evt_test_12345",
        "event": "payment.captured",
        "payload": {
            "payment": {
                "entity": {
                    "id": "pay_captured_999",
                    "order_id": order.provider_order_id,
                    "status": "captured"
                }
            }
        }
    }
    raw_body = json.dumps(webhook_payload).encode("utf-8")
    secret = "whsec_defai_sentinel_sandbox_test"
    valid_signature = hmac.new(secret.encode(), raw_body, hashlib.sha256).hexdigest()

    # Process first webhook
    proc_ok, proc_msg = PaymentGatewayService.process_webhook_event(
        db=test_db,
        event_payload=webhook_payload,
        signature_header=valid_signature,
        raw_body_bytes=raw_body
    )
    assert proc_ok is True
    assert proc_msg == "WEBHOOK_PROCESSED"

    # Refresh order and transaction
    test_db.refresh(order)
    test_db.refresh(tx)
    assert order.status == "CAPTURED"
    assert order.webhook_verified is True
    assert tx.status == "COMPLETED"

    # Replay same webhook event: must detect duplicate event and return ALREADY_PROCESSED
    proc_ok2, proc_msg2 = PaymentGatewayService.process_webhook_event(
        db=test_db,
        event_payload=webhook_payload,
        signature_header=valid_signature,
        raw_body_bytes=raw_body
    )
    assert proc_ok2 is True
    assert proc_msg2 == "EVENT_ALREADY_PROCESSED"

def test_live_money_guardrail():
    """Verifies that live payments fail closed if ALLOW_LIVE_PAYMENTS is False."""
    from app.config import Settings
    with pytest.raises(ValueError) as exc:
        Settings(PAYMENT_MODE="live", ALLOW_LIVE_PAYMENTS=False)
    assert "CRITICAL SECURITY ERROR" in str(exc.value)

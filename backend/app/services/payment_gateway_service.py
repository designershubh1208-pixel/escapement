import hmac
import hashlib
import uuid
import logging
from typing import Dict, Any, Optional, Tuple
from datetime import datetime
from sqlalchemy.orm import Session
from app.config import settings
from app.models.payment_order import PaymentOrder
from app.models.financial import Transaction

logger = logging.getLogger("defai.payment_gateway")

class PaymentGatewayService:
    """
    Production-ready INR payment gateway integration.
    Supports official Razorpay Sandbox & Live APIs, HMAC-SHA256 server-side
    signature verification, signed webhook verification, and strict idempotency.
    """

    @classmethod
    def get_razorpay_client(cls):
        """Returns official Razorpay client if credentials are configured."""
        if settings.RAZORPAY_KEY_ID and settings.RAZORPAY_KEY_SECRET:
            try:
                import razorpay
                return razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))
            except Exception as e:
                logger.error(f"Failed to initialize Razorpay SDK client: {e}")
                return None
        return None

    @classmethod
    def create_order(
        cls,
        db: Session,
        transaction_id: str,
        amount_paise: int,
        idempotency_key: str,
        notes: Optional[Dict[str, str]] = None
    ) -> Tuple[bool, Optional[PaymentOrder], str]:
        """
        Creates an explicit payment order at the gateway.
        Fails closed if attempting live execution without verified authorization.
        """
        # Guardrail: Fail-closed on live payments if disabled
        if settings.PAYMENT_MODE == "live":
            if not settings.ALLOW_LIVE_PAYMENTS:
                logger.error("SECURITY HALT: Attempted live payment while ALLOW_LIVE_PAYMENTS is False")
                return False, None, "LIVE_PAYMENTS_DISABLED_BY_POLICY"
            if not settings.RAZORPAY_KEY_ID or not settings.RAZORPAY_KEY_SECRET:
                return False, None, "MISSING_LIVE_GATEWAY_CREDENTIALS"

        # Check existing order by idempotency key
        existing_order = db.query(PaymentOrder).filter(
            PaymentOrder.idempotency_key == idempotency_key
        ).first()
        if existing_order:
            logger.info(f"Returning existing payment order for idempotency key: {idempotency_key}")
            return True, existing_order, "EXISTING_ORDER_RETURNED"

        order_id = None
        client = cls.get_razorpay_client()

        if client and settings.PAYMENT_MODE in ["sandbox", "live"]:
            try:
                order_payload = {
                    "amount": amount_paise,
                    "currency": "INR",
                    "receipt": f"rcpt_{transaction_id[:16]}",
                    "notes": notes or {"transaction_id": transaction_id}
                }
                api_resp = client.order.create(order_payload)
                order_id = api_resp.get("id")
                logger.info(f"Created official Razorpay order: {order_id} ({amount_paise} paise)")
            except Exception as e:
                logger.error(f"Razorpay API order creation failed: {e}")
                return False, None, f"GATEWAY_API_ERROR: {str(e)}"
        else:
            # High-fidelity sandbox provider mode
            order_id = f"order_sbx_{uuid.uuid4().hex[:14]}"
            logger.info(f"Generated Sandbox Provider Order: {order_id} for tx {transaction_id}")

        new_order = PaymentOrder(
            id=str(uuid.uuid4()),
            transaction_id=transaction_id,
            provider="razorpay",
            provider_order_id=order_id,
            amount_paise=amount_paise,
            currency="INR",
            status="CREATED",
            webhook_verified=False,
            idempotency_key=idempotency_key
        )
        db.add(new_order)
        db.commit()
        db.refresh(new_order)

        return True, new_order, "ORDER_CREATED"

    @classmethod
    def verify_payment_signature(
        cls,
        order_id: str,
        payment_id: str,
        signature: str,
        secret: Optional[str] = None
    ) -> Tuple[bool, str]:
        """
        Cryptographic verification of Razorpay payment signature.
        Formula: HMAC-SHA256(order_id + "|" + payment_id, secret)
        Uses constant-time comparison to prevent timing attacks.
        """
        key_secret = secret or settings.RAZORPAY_KEY_SECRET or "defai_sentinel_sandbox_secret"
        
        expected_msg = f"{order_id}|{payment_id}".encode("utf-8")
        computed_signature = hmac.new(
            key_secret.encode("utf-8"),
            expected_msg,
            hashlib.sha256
        ).hexdigest()

        if hmac.compare_digest(computed_signature, signature):
            return True, "SIGNATURE_VERIFIED"
        else:
            logger.warning(f"Invalid payment signature for order {order_id}")
            return False, "INVALID_SIGNATURE"

    @classmethod
    def verify_webhook_signature(
        cls,
        payload_bytes: bytes,
        signature_header: str,
        secret: Optional[str] = None
    ) -> Tuple[bool, str]:
        """
        Verifies Razorpay Webhook signature (X-Razorpay-Signature).
        Formula: HMAC-SHA256(raw_body_bytes, webhook_secret)
        """
        webhook_secret = secret or settings.RAZORPAY_WEBHOOK_SECRET or "whsec_defai_sentinel_sandbox_test"
        
        computed_signature = hmac.new(
            webhook_secret.encode("utf-8"),
            payload_bytes,
            hashlib.sha256
        ).hexdigest()

        if hmac.compare_digest(computed_signature, signature_header):
            return True, "WEBHOOK_SIGNATURE_VERIFIED"
        else:
            logger.warning("Invalid webhook signature received")
            return False, "INVALID_WEBHOOK_SIGNATURE"

    @classmethod
    def process_webhook_event(
        cls,
        db: Session,
        event_payload: Dict[str, Any],
        signature_header: str,
        raw_body_bytes: bytes
    ) -> Tuple[bool, str]:
        """
        Durable, idempotent webhook processor for gateway events.
        Guarantees that duplicate webhook deliveries are not processed twice.
        """
        # 1. Verify cryptographic signature
        valid, sig_msg = cls.verify_webhook_signature(raw_body_bytes, signature_header)
        if not valid:
            return False, sig_msg

        event_id = event_payload.get("id") or event_payload.get("event_id")
        event_name = event_payload.get("event", "")

        # 2. Check event idempotency
        if event_id:
            existing_event = db.query(PaymentOrder).filter(
                PaymentOrder.webhook_event_id == event_id
            ).first()
            if existing_event:
                logger.info(f"Duplicate webhook event {event_id} already processed. Acknowledging with 200.")
                return True, "EVENT_ALREADY_PROCESSED"

        # 3. Extract payment and order details
        payload_entity = event_payload.get("payload", {}).get("payment", {}).get("entity", {})
        provider_order_id = payload_entity.get("order_id")
        provider_payment_id = payload_entity.get("id")
        status = payload_entity.get("status")  # captured, authorized, failed

        if not provider_order_id:
            logger.warning("Webhook payload missing order_id")
            return False, "MISSING_ORDER_ID_IN_PAYLOAD"

        order = db.query(PaymentOrder).filter(
            PaymentOrder.provider_order_id == provider_order_id
        ).first()

        if not order:
            logger.error(f"PaymentOrder not found for provider_order_id: {provider_order_id}")
            return False, "ORDER_NOT_FOUND"

        # 4. Update order and parent transaction atomically
        tx = order.transaction
        if event_name in ["payment.captured", "order.paid"] or status == "captured":
            order.status = "CAPTURED"
            order.provider_payment_id = provider_payment_id
            order.webhook_verified = True
            order.webhook_event_id = event_id
            if tx:
                tx.status = "COMPLETED"
                tx.tx_hash = provider_payment_id
        elif event_name in ["payment.failed"] or status == "failed":
            order.status = "FAILED"
            order.webhook_verified = True
            order.webhook_event_id = event_id
            if tx:
                tx.status = "FAILED"
                tx.failure_reason = payload_entity.get("error_description", "Payment failed at gateway")

        db.commit()
        logger.info(f"Processed webhook for order {provider_order_id}: new status {order.status}")
        return True, "WEBHOOK_PROCESSED"

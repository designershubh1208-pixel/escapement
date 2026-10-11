import json
import logging
from fastapi import APIRouter, Request, Header, Depends, HTTPException, Response
from sqlalchemy.orm import Session
from app.database import get_db
from app.services.payment_gateway_service import PaymentGatewayService
from app.services.audit_service import AuditService

logger = logging.getLogger("defai.api.webhooks")
router = APIRouter(prefix="/api/webhooks", tags=["Webhooks"])

@router.post("/payment/razorpay")
async def handle_razorpay_webhook(
    request: Request,
    x_razorpay_signature: str = Header(None, alias="X-Razorpay-Signature"),
    db: Session = Depends(get_db)
):
    """
    Receives and cryptographically verifies server-to-server webhook notifications
    from Razorpay (payment.captured, payment.failed, order.paid).
    Guarantees strict idempotency and anti-tampering.
    """
    if not x_razorpay_signature:
        logger.warning("Webhook request missing X-Razorpay-Signature header")
        raise HTTPException(status_code=400, detail="Missing signature header")

    raw_body = await request.body()
    try:
        event_payload = json.loads(raw_body.decode("utf-8"))
    except Exception as e:
        logger.error(f"Malformed webhook JSON body: {e}")
        raise HTTPException(status_code=400, detail="Malformed JSON body")

    ok, result_msg = PaymentGatewayService.process_webhook_event(
        db=db,
        event_payload=event_payload,
        signature_header=x_razorpay_signature,
        raw_body_bytes=raw_body
    )

    if not ok:
        AuditService.record_event(
            db=db,
            action="WEBHOOK_VERIFICATION_REJECTED",
            details={"error": result_msg, "event": event_payload.get("event")},
            user_id="gateway_system"
        )
        raise HTTPException(status_code=400, detail=result_msg)

    AuditService.record_event(
        db=db,
        action="WEBHOOK_VERIFICATION_SUCCESS",
        details={"event": event_payload.get("event"), "result": result_msg},
        user_id="gateway_system"
    )

    return {"status": "success", "message": result_msg}

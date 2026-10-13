import uuid
import json
import logging
from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.models.chat import ChatSession, ChatMessage
from app.models.financial import Transaction, Approval
from app.models.policy import UserPolicy
from app.schemas.chat import ChatMessageRequest, ChatResponse, ChatSessionItem, ChatMessageItem
from app.config import settings
from app.services.ai_service import ai_provider
from app.services.auth_service import AuthService
from app.services.policy_engine import DeterministicPolicyEngine
from app.services.audit_service import AuditService
from app.services.mock_payment import MockPaymentExecutor
from app.services.evm_service import evm_service
from app.services.subscription_service import SubscriptionService
from app.services.ecommerce_service import EcommerceService
from app.services.payment_gateway_service import PaymentGatewayService
from app.services.browser_automation import BrowserAutomationService

logger = logging.getLogger("defai.api.chat")
router = APIRouter(prefix="/api/chat", tags=["Chat"])

@router.post("", response_model=ChatResponse)
async def send_chat_message(
    req: ChatMessageRequest, 
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db)
):
    # 0. Resolve user identity from Bearer token or fallback
    user_id = AuthService.resolve_user_id(db, authorization, req.user_id)

    # Ensure user exists in database so foreign key constraints never fail
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        user = User(
            id=user_id,
            name="Sentinel User",
            email="user@defai.local",
            is_verified=True
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        AuthService.ensure_user_environment(db, user.id)

    session_id = req.session_id

    # 1. Authenticate user & ensure session exists for THIS user
    if not session_id:
        session_id = str(uuid.uuid4())
        session_title = (req.message[:35] + "...") if len(req.message) > 35 else req.message
        new_session = ChatSession(id=session_id, user_id=user_id, title=session_title)
        db.add(new_session)
        db.commit()
    else:
        existing_session = db.query(ChatSession).filter(
            ChatSession.id == session_id,
            ChatSession.user_id == user_id
        ).first()
        if not existing_session:
            session_title = (req.message[:35] + "...") if len(req.message) > 35 else req.message
            new_session = ChatSession(id=session_id, user_id=user_id, title=session_title)
            db.add(new_session)
            db.commit()

    # 2. Persist original user chat message
    user_msg_record = ChatMessage(
        session_id=session_id,
        role="user",
        content=req.message
    )
    db.add(user_msg_record)
    db.commit()

    # 3. AI reasoning layer (Generates conversational response, multi-store price comparison, & structured intent)
    intent = await ai_provider.extract_intent(req.message)

    # Detect if user is asking about product pricing, availability, or deals across e-commerce stores
    price_triggers = [
        "price", "cost", "how much", "rate", "best value", "deal", "deals", 
        "cheap", "cheapest", "discount", "where to buy", "compare price", "best buy",
        "flipkart or amazon", "amazon or flipkart", "current price"
    ]
    product_indicators = [
        "laptop", "phone", "rtx", "gpu", "keyboard", "monitor", "iphone", 
        "macbook", "headphone", "earphone", "tv", "playstation", "ps5", 
        "omen", "victus", "keychron", "ipad", "tablet", "watch"
    ]
    text_lower = req.message.lower().strip()
    is_price_inquiry = any(t in text_lower for t in price_triggers) or (
        any(p in text_lower for p in product_indicators) and any(w in text_lower for w in ["find", "search", "check", "current", "what is", "spec", "vram", "gb"])
    )

    if is_price_inquiry and (not intent or intent.action not in ["PURCHASE", "CANCEL_SUBSCRIPTION"]):
        logger.info(f"Detected e-commerce price inquiry: '{req.message}'. Scraping multi-store live prices...")
        from app.services.live_ecommerce_scraper import LiveEcommerceScraperService
        comparison = await LiveEcommerceScraperService.compare_stores_and_get_summary(req.message)
        ai_response_text = comparison.get("summary_markdown")
    elif not intent or intent.action not in ["PURCHASE", "CANCEL_SUBSCRIPTION", "TRANSFER", "TICKET_PURCHASE"]:
        ai_response_text = await ai_provider.general_qa(req.message)
    else:
        ai_response_text = "Processing request..."

    has_financial_intent = False
    decision = "NONE"
    reasons = []
    transaction_id = None

    # Handle subscription cancellation special case
    if intent.action == "CANCEL_SUBSCRIPTION" and intent.merchant:
        has_financial_intent = True
        transaction_id = str(uuid.uuid4())
        success, sub_msg = SubscriptionService.cancel_subscription(db, intent.merchant, user_id)
        decision = "APPROVE" if success else "BLOCK"
        reasons = ["SUBSCRIPTION_TERMINATOR_EXECUTED" if success else "SUBSCRIPTION_NOT_FOUND"]
        
        # Persist transaction record
        tx = Transaction(
            id=transaction_id,
            idempotency_key=f"sub-cancel-{session_id}-{int(datetime.utcnow().timestamp())}",
            session_id=session_id,
            user_id=user_id,
            user_message=req.message,
            intent_json=intent.model_dump_json(),
            action=intent.action,
            merchant=intent.merchant,
            status="COMPLETED" if success else "BLOCKED",
            policy_decision=decision,
            policy_reasons=json.dumps(reasons)
        )
        db.add(tx)
        db.commit()
        
        AuditService.record_event(
            db=db,
            action="SUBSCRIPTION_CANCELLED" if success else "SUBSCRIPTION_CANCEL_FAILED",
            details={"service": intent.merchant, "result": sub_msg},
            user_id=user_id,
            transaction_id=transaction_id
        )
        ai_response_text = f"{sub_msg}"

    elif intent and intent.action in ["PURCHASE", "TRANSFER", "TICKET_PURCHASE"]:
        has_financial_intent = True
        transaction_id = str(uuid.uuid4())
        idempotency_key = f"tx-{session_id}-{int(datetime.utcnow().timestamp())}"

        # 4. Check live e-commerce stock and execute headless browser action using Session Key
        browser_res = None
        if intent.action == "PURCHASE":
            browser_res = await BrowserAutomationService.execute_ecommerce_action(
                db=db,
                user_id=user_id,
                merchant=intent.merchant or "Flipkart",
                product_query=req.message
            )

            if browser_res.get("status") == "OUT_OF_STOCK":
                tx = Transaction(
                    id=transaction_id,
                    idempotency_key=idempotency_key,
                    session_id=session_id,
                    user_id=user_id,
                    user_message=req.message,
                    intent_json=intent.model_dump_json(),
                    action=intent.action,
                    merchant=browser_res.get("merchant", intent.merchant or "Flipkart"),
                    category="General",
                    amount_paise=browser_res.get("price_paise", intent.amount_paise or 0),
                    currency="INR",
                    status="SCHEDULED",
                    policy_decision="SCHEDULED_STOCK_MONITOR",
                    policy_reasons=json.dumps(["OUT_OF_STOCK_CART_MONITOR"])
                )
                db.add(tx)
                db.commit()
                AuditService.record_event(
                    db=db,
                    action="STOCK_MONITOR_SCHEDULED",
                    details={"product": browser_res.get("product_title"), "merchant": browser_res.get("merchant")},
                    user_id=user_id,
                    transaction_id=transaction_id
                )
                ai_response_text = browser_res.get("message")
                
                # Persist assistant message and return immediately
                assistant_msg = ChatMessage(
                    session_id=session_id,
                    role="assistant",
                    content=ai_response_text,
                    intent_json=intent.model_dump_json()
                )
                db.add(assistant_msg)
                db.commit()

                return ChatResponse(
                    session_id=session_id,
                    user_id=user_id,
                    response=ai_response_text,
                    has_financial_intent=True,
                    transaction_id=transaction_id,
                    action=intent.action,
                    amount_paise=browser_res.get("price_paise", intent.amount_paise or 0),
                    currency="INR",
                    merchant=browser_res.get("merchant", intent.merchant or "Flipkart"),
                    policy_decision="SCHEDULED",
                    policy_reasons=["OUT_OF_STOCK_CART_MONITOR"]
                )

            # Sync verified price and merchant if detected
            if browser_res and browser_res.get("price_paise") and (not intent.amount_paise or intent.amount_paise == 0):
                intent.amount_paise = browser_res["price_paise"]
            if browser_res and browser_res.get("merchant"):
                intent.merchant = browser_res["merchant"]

        # 5. Create financial transaction record with PENDING state
        tx = Transaction(
            id=transaction_id,
            idempotency_key=idempotency_key,
            session_id=session_id,
            user_id=user_id,
            user_message=req.message,
            intent_json=intent.model_dump_json(),
            action=intent.action,
            merchant=intent.merchant or "Unknown",
            category=intent.category or "General",
            amount_paise=intent.amount_paise,
            currency=intent.currency or "INR",
            status="PENDING"
        )
        db.add(tx)
        db.commit()

        # 6. Deterministic Policy Evaluation
        decision, reasons, policy = DeterministicPolicyEngine.evaluate(db, intent, user_id)
        tx.policy_decision = decision
        tx.policy_reasons = json.dumps(reasons)
        if policy:
            tx.policy_id = policy.id
            tx.policy_version = policy.version

        if decision == "BLOCK":
            tx.status = "BLOCKED"
            tx.failure_reason = "; ".join(reasons)
            db.commit()
            AuditService.record_event(
                db=db,
                action="DECISION_BLOCK",
                details={"reasons": reasons, "amount_paise": intent.amount_paise, "merchant": intent.merchant},
                user_id=user_id,
                transaction_id=transaction_id
            )
            ai_response_text = f"Transaction blocked by deterministic policy: {', '.join(reasons)}."

        elif decision == "REQUIRE_APPROVAL":
            tx.status = "REQUIRES_APPROVAL"
            approval = Approval(
                transaction_id=transaction_id,
                user_id=user_id,
                status="PENDING",
                decision_reasons=json.dumps(reasons)
            )
            db.add(approval)
            db.commit()
            AuditService.record_event(
                db=db,
                action="DECISION_REQUIRE_APPROVAL",
                details={"reasons": reasons, "amount_paise": intent.amount_paise, "merchant": intent.merchant},
                user_id=user_id,
                transaction_id=transaction_id
            )
            ai_response_text = f"Financial request created for {intent.merchant or 'merchant'} (₹{(intent.amount_paise or 0)/100:.2f}). Requires explicit human approval before execution."

        elif decision == "APPROVE":
            # 6. Scoped EVM Permission Check
            perm_id = tx.blockchain_permission_id or ("0x" + uuid.uuid4().hex)
            tx.blockchain_permission_id = perm_id
            evm_valid, evm_reason = evm_service.verify_permission(perm_id, intent.amount_paise or 0)
            
            # Note: In local dev if Anvil is offline, log EVM verify status
            AuditService.record_event(
                db=db,
                action="EVM_PERMISSION_CHECK",
                details={"permission_id": perm_id, "result": evm_reason, "valid": evm_valid},
                user_id=user_id,
                transaction_id=transaction_id
            )

            # 7. Settle Payment & Create Gateway Order
            gw_ok, gw_order, gw_msg = False, None, None
            if settings.PAYMENT_MODE in ["sandbox", "live"]:
                gw_ok, gw_order, gw_msg = PaymentGatewayService.create_order(
                    db=db,
                    transaction_id=transaction_id,
                    amount_paise=intent.amount_paise or 0,
                    idempotency_key=f"gw-chat-{transaction_id}"
                )

            res_ok, res_msg = MockPaymentExecutor.reserve_funds(db, user_id, intent.amount_paise or 0, transaction_id)
            if not res_ok:
                tx.status = "FAILED"
                tx.failure_reason = res_msg
                db.commit()
                AuditService.record_event(
                    db=db,
                    action="PAYMENT_FAILED",
                    details={"reason": res_msg},
                    user_id=user_id,
                    transaction_id=transaction_id
                )
                ai_response_text = f"Payment execution failed: {res_msg}."
            else:
                pay_ok, pay_msg, pay_ref = MockPaymentExecutor.execute_payment(
                    db=db,
                    user_id=user_id,
                    amount_paise=intent.amount_paise or 0,
                    transaction_id=transaction_id,
                    description=f"Purchase at {intent.merchant or 'Merchant'}"
                )
                if pay_ok:
                    tx.status = "COMPLETED"
                    tx.tx_hash = pay_ref
                    db.commit()
                    AuditService.record_event(
                        db=db,
                        action="PAYMENT_EXECUTED",
                        details={
                            "payment_ref": pay_ref,
                            "gateway_order_id": gw_order.provider_order_id if (gw_ok and gw_order) else None,
                            "amount_paise": intent.amount_paise,
                            "merchant": intent.merchant
                        },
                        user_id=user_id,
                        transaction_id=transaction_id
                    )
                    gw_ref_str = f" [Gateway: {gw_order.provider_order_id}]" if (gw_ok and gw_order) else ""
                    cart_note = "Item queued in cart via Session Key. " if (browser_res and browser_res.get("status") == "CART_ADDED") else ""
                    ai_response_text = f"Purchase authorized! {cart_note}Payment Ref: {pay_ref}{gw_ref_str} (₹{(intent.amount_paise or 0)/100:.2f} at {intent.merchant}). Please confirm final OTP on your phone to complete order."
                else:
                    tx.status = "FAILED"
                    tx.failure_reason = pay_msg
                    MockPaymentExecutor.release_reservation(db, user_id, intent.amount_paise or 0, transaction_id)
                    db.commit()
                    ai_response_text = f"Payment settlement failed: {pay_msg}."

    # 8. Persist assistant chat message
    assistant_msg = ChatMessage(
        session_id=session_id,
        role="assistant",
        content=ai_response_text,
        intent_json=intent.model_dump_json() if intent else None
    )
    db.add(assistant_msg)
    db.commit()

    return ChatResponse(
        session_id=session_id,
        response=ai_response_text,
        intent=intent,
        hasFinancialIntent=has_financial_intent,
        decision=decision,
        policy_reasons=reasons,
        transaction_id=transaction_id
    )

@router.get("/sessions", response_model=list[ChatSessionItem])
def list_chat_sessions(
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db)
):
    """Returns only the chat sessions belonging to the authenticated user."""
    user_id = AuthService.resolve_user_id(db, authorization)
    sessions = db.query(ChatSession).filter(
        ChatSession.user_id == user_id
    ).order_by(ChatSession.created_at.desc()).all()
    return sessions

@router.get("/sessions/{session_id}", response_model=list[ChatMessageItem])
def get_chat_session_messages(
    session_id: str, 
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db)
):
    """Returns messages for a session only if it belongs to the authenticated user."""
    user_id = AuthService.resolve_user_id(db, authorization)
    
    # Verify session ownership
    session = db.query(ChatSession).filter(
        ChatSession.id == session_id,
        ChatSession.user_id == user_id
    ).first()
    if not session:
        return []

    messages = db.query(ChatMessage).filter(
        ChatMessage.session_id == session_id
    ).order_by(ChatMessage.created_at.asc()).all()

    return [
        ChatMessageItem(
            role=m.role,
            content=m.content,
            timestamp=m.created_at,
            intent_json=m.intent_json
        )
        for m in messages
    ]

@router.delete("/sessions/{session_id}")
def delete_chat_session(
    session_id: str,
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db)
):
    """Deletes a chat session and its messages if owned by the authenticated user."""
    user_id = AuthService.resolve_user_id(db, authorization)
    session = db.query(ChatSession).filter(
        ChatSession.id == session_id,
        ChatSession.user_id == user_id
    ).first()
    if session:
        db.query(ChatMessage).filter(ChatMessage.session_id == session_id).delete()
        db.delete(session)
        db.commit()
        return {"success": True, "message": "Chat session deleted"}
    return {"success": False, "message": "Session not found"}

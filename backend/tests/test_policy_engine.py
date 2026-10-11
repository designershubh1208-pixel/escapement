import pytest
from app.schemas.intent import StructuredIntent
from app.services.policy_engine import DeterministicPolicyEngine
from app.services.kill_switch import kill_switch
from app.models.financial import Transaction

def test_allowed_purchase_within_auto_threshold(test_db):
    """₹450 (45,000 paise) at Amazon should be eligible for automatic APPROVE"""
    intent = StructuredIntent(
        action="PURCHASE",
        merchant="Amazon",
        category="electronics",
        amount_paise=45000,
        currency="INR"
    )
    decision, reasons, policy = DeterministicPolicyEngine.evaluate(test_db, intent, "user_1")
    assert decision == "APPROVE"
    assert "ALL_POLICY_CONDITIONS_SATISFIED" in reasons

def test_purchase_exceeding_auto_threshold_requires_approval(test_db):
    """₹800 (80,000 paise) at Amazon is above ₹500 auto-threshold but under ₹5,000 hard limit -> REQUIRE_APPROVAL"""
    intent = StructuredIntent(
        action="PURCHASE",
        merchant="Amazon",
        category="electronics",
        amount_paise=80000,
        currency="INR"
    )
    decision, reasons, policy = DeterministicPolicyEngine.evaluate(test_db, intent, "user_1")
    assert decision == "REQUIRE_APPROVAL"
    assert "REQUIRES_HUMAN_APPROVAL" in reasons

def test_purchase_exceeding_hard_limit_is_blocked(test_db):
    """₹5,500 (550,000 paise) at Amazon exceeds ₹5,000 hard limit -> BLOCK"""
    intent = StructuredIntent(
        action="PURCHASE",
        merchant="Amazon",
        category="electronics",
        amount_paise=550000,
        currency="INR"
    )
    decision, reasons, policy = DeterministicPolicyEngine.evaluate(test_db, intent, "user_1")
    assert decision == "BLOCK"
    assert "AMOUNT_EXCEEDS_LIMIT" in reasons

def test_blocked_merchant_is_rejected(test_db):
    """Purchase at explicitly blocked merchant 'GamblingHub' -> BLOCK"""
    intent = StructuredIntent(
        action="PURCHASE",
        merchant="GamblingHub",
        category="electronics",
        amount_paise=45000,
        currency="INR"
    )
    decision, reasons, policy = DeterministicPolicyEngine.evaluate(test_db, intent, "user_1")
    assert decision == "BLOCK"
    assert "MERCHANT_BLOCKED" in reasons

def test_unallowlisted_merchant_is_rejected(test_db):
    """Purchase at unapproved merchant 'RandomStore' -> BLOCK"""
    intent = StructuredIntent(
        action="PURCHASE",
        merchant="RandomStore",
        category="electronics",
        amount_paise=45000,
        currency="INR"
    )
    decision, reasons, policy = DeterministicPolicyEngine.evaluate(test_db, intent, "user_1")
    assert decision == "BLOCK"
    assert "MERCHANT_NOT_ALLOWED" in reasons

def test_blocked_category_is_rejected(test_db):
    """Purchase under blocked category 'crypto' -> BLOCK"""
    intent = StructuredIntent(
        action="PURCHASE",
        merchant="Amazon",
        category="crypto",
        amount_paise=45000,
        currency="INR"
    )
    decision, reasons, policy = DeterministicPolicyEngine.evaluate(test_db, intent, "user_1")
    assert decision == "BLOCK"
    assert "CATEGORY_NOT_ALLOWED" in reasons

def test_daily_limit_exceeded(test_db):
    """Spending more than ₹2,000 in a day is blocked"""
    # Insert completed transaction of ₹1,800 today
    tx = Transaction(
        id="prev-tx-1",
        idempotency_key="key-prev-1",
        user_id="user_1",
        amount_paise=180000,
        status="COMPLETED"
    )
    test_db.add(tx)
    test_db.commit()

    # Attempt another purchase of ₹300 (total would be ₹2,100 > ₹2,000)
    intent = StructuredIntent(
        action="PURCHASE",
        merchant="Amazon",
        category="electronics",
        amount_paise=30000,
        currency="INR"
    )
    decision, reasons, policy = DeterministicPolicyEngine.evaluate(test_db, intent, "user_1")
    assert decision == "BLOCK"
    assert "DAILY_LIMIT_EXCEEDED" in reasons

def test_kill_switch_blocks_evaluation(test_db):
    """When kill switch is active, all transactions are blocked immediately"""
    kill_switch.trigger("user_1")
    intent = StructuredIntent(
        action="PURCHASE",
        merchant="Amazon",
        category="electronics",
        amount_paise=45000,
        currency="INR"
    )
    decision, reasons, policy = DeterministicPolicyEngine.evaluate(test_db, intent, "user_1")
    assert decision == "BLOCK"
    assert "KILL_SWITCH_ACTIVE" in reasons

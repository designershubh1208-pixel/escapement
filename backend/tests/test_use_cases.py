import pytest
from app.services.subscription_service import SubscriptionService
from app.services.ticket_service import TicketSniperService
from app.models.financial import Subscription

def test_subscription_terminator_cancels_service(test_db):
    """Core Use Case 16.2: Cancel Netflix subscription"""
    SubscriptionService.ensure_seed_subscriptions(test_db, "user_1")
    
    # Verify initially active
    netflix = test_db.query(Subscription).filter(
        Subscription.user_id == "user_1",
        Subscription.service_name == "Netflix"
    ).first()
    assert netflix.status == "ACTIVE"

    # Cancel via service
    success, msg = SubscriptionService.cancel_subscription(test_db, "Netflix", "user_1")
    assert success is True

    test_db.refresh(netflix)
    assert netflix.status == "CANCELLED"
    assert "user requested cancellation" in netflix.cancellation_reason.lower()

def test_subscription_terminator_non_existent_service(test_db):
    SubscriptionService.ensure_seed_subscriptions(test_db, "user_1")
    success, msg = SubscriptionService.cancel_subscription(test_db, "NonExistentService", "user_1")
    assert success is False
    assert "No active subscription found" in msg

def test_ticket_sniper_under_budget(test_db):
    """Core Use Case 16.3: Ticket Sniper when total payable is within budget"""
    # 2 tickets @ ₹1,200 base = ₹2,400 + 18% GST (₹432) + ₹50 fee = ₹2,882 (288,200 paise)
    # Budget = ₹3,000 (300,000 paise)
    allowed, details = TicketSniperService.simulate_ticket_drop(
        event_name="Coldplay Mumbai",
        ticket_count=2,
        max_budget_paise=300000
    )
    assert allowed is True
    assert details["total_payable_paise"] <= 300000

def test_ticket_sniper_exceeds_budget(test_db):
    """Ticket Sniper when total payable exceeds budget"""
    # 3 tickets @ ₹1,200 base = ₹3,600 + taxes > ₹3,000 budget
    allowed, details = TicketSniperService.simulate_ticket_drop(
        event_name="Coldplay Mumbai",
        ticket_count=3,
        max_budget_paise=300000
    )
    assert allowed is False
    assert details["total_payable_paise"] > 300000

import json
import logging
from typing import Tuple, List, Optional
from datetime import datetime, date
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.policy import UserPolicy
from app.models.financial import Transaction
from app.schemas.intent import StructuredIntent
from app.services.kill_switch import kill_switch

logger = logging.getLogger("defai.policy_engine")

class DeterministicPolicyEngine:
    @staticmethod
    def evaluate(
        db: Session,
        intent: StructuredIntent,
        user_id: str = "user_1"
    ) -> Tuple[str, List[str], Optional[UserPolicy]]:
        """
        Evaluates a structured intent against deterministic business policies.
        Decision precedence:
          1. Any mandatory denial results in 'BLOCK'.
          2. If no mandatory denial exists but approval is needed, returns 'REQUIRE_APPROVAL'.
          3. Returns 'APPROVE' only if all mandatory conditions pass and amount <= threshold.
        """
        reasons: List[str] = []

        # 1. Kill Switch Check (Fail-closed emergency stop)
        if kill_switch.is_active(user_id):
            return "BLOCK", ["KILL_SWITCH_ACTIVE"], None

        # If action is NONE or CANCEL_SUBSCRIPTION, handle accordingly
        if intent.action == "NONE":
            return "NONE", ["NO_FINANCIAL_ACTION"], None

        if intent.action == "CANCEL_SUBSCRIPTION":
            # Handled by subscription service verification
            return "APPROVE", ["SUBSCRIPTION_CANCELLATION_ALLOWED"], None

        # Fetch active user policy
        policy = db.query(UserPolicy).filter(
            UserPolicy.user_id == user_id,
            UserPolicy.is_active == True
        ).first()

        if not policy:
            # Create default policy if none exists yet
            policy = UserPolicy(
                user_id=user_id,
                daily_limit_paise=200000,           # ₹2,000
                per_transaction_limit_paise=50000,  # ₹500
                monthly_limit_paise=1000000,        # ₹10,000
                approval_threshold_paise=50000,     # ₹500
                allowlisted_merchants='["Amazon", "Flipkart"]',
                blocked_merchants='[]',
                allowlisted_categories='["electronics", "books", "groceries", "subscription", "ticket"]',
                blocked_categories='["gambling", "crypto", "adult"]'
            )
            db.add(policy)
            db.commit()
            db.refresh(policy)

        # Parse allowlists & blocklists
        try:
            allow_merchants = [m.lower() for m in json.loads(policy.allowlisted_merchants or "[]")]
            block_merchants = [m.lower() for m in json.loads(policy.blocked_merchants or "[]")]
            allow_categories = [c.lower() for c in json.loads(policy.allowlisted_categories or "[]")]
            block_categories = [c.lower() for c in json.loads(policy.blocked_categories or "[]")]
        except Exception:
            allow_merchants, block_merchants = ["amazon", "flipkart"], []
            allow_categories, block_categories = ["electronics", "ticket"], []

        requested_paise = intent.amount_paise or 0

        # Mandatory Block Check 1: Negative or Missing amount on purchase
        if intent.action in ["PURCHASE", "TICKET_PURCHASE"] and (intent.amount_paise is None or intent.amount_paise <= 0):
            reasons.append("INVALID_OR_MISSING_TRANSACTION_AMOUNT")

        # Mandatory Block Check 2: Per-transaction hard limit
        if requested_paise > policy.per_transaction_limit_paise:
            reasons.append("AMOUNT_EXCEEDS_LIMIT")

        # Mandatory Block Check 3: Merchant Blocklist / Allowlist
        if intent.merchant:
            m_norm = intent.merchant.lower()
            if m_norm in block_merchants:
                reasons.append("MERCHANT_BLOCKED")
            elif allow_merchants and m_norm not in allow_merchants:
                reasons.append("MERCHANT_NOT_ALLOWED")
        else:
            reasons.append("MERCHANT_SPECIFICATION_REQUIRED")

        # Mandatory Block Check 4: Category Blocklist / Allowlist
        if intent.category:
            c_norm = intent.category.lower()
            if c_norm in block_categories:
                reasons.append("CATEGORY_NOT_ALLOWED")
            elif allow_categories and c_norm not in allow_categories:
                reasons.append("CATEGORY_NOT_ALLOWED")

        # Calculate today's spend
        today_start = datetime.combine(date.today(), datetime.min.time())
        today_spent = db.query(func.coalesce(func.sum(Transaction.amount_paise), 0)).filter(
            Transaction.user_id == user_id,
            Transaction.status.in_(["COMPLETED", "AUTHORIZED", "EXECUTING"]),
            Transaction.created_at >= today_start
        ).scalar() or 0

        # Mandatory Block Check 5: Daily Limit
        if today_spent + requested_paise > policy.daily_limit_paise:
            reasons.append("DAILY_LIMIT_EXCEEDED")

        # Calculate month's spend
        first_of_month = datetime(date.today().year, date.today().month, 1)
        month_spent = db.query(func.coalesce(func.sum(Transaction.amount_paise), 0)).filter(
            Transaction.user_id == user_id,
            Transaction.status.in_(["COMPLETED", "AUTHORIZED", "EXECUTING"]),
            Transaction.created_at >= first_of_month
        ).scalar() or 0

        # Mandatory Block Check 6: Monthly Limit
        if month_spent + requested_paise > policy.monthly_limit_paise:
            reasons.append("MONTHLY_LIMIT_EXCEEDED")

        # If any mandatory check failed, decision is strictly BLOCK
        if reasons:
            return "BLOCK", reasons, policy

        # Human Approval Check: If amount exceeds automatic threshold or intent explicitly flagged
        if requested_paise > policy.approval_threshold_paise or intent.requires_approval:
            return "REQUIRE_APPROVAL", ["REQUIRES_HUMAN_APPROVAL", "AMOUNT_EXCEEDS_AUTO_THRESHOLD"], policy

        # If all checks pass and within automatic threshold
        return "APPROVE", ["ALL_POLICY_CONDITIONS_SATISFIED"], policy

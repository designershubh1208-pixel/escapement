import logging
from typing import Optional, List
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.ecommerce import ProductCatalog
from app.services.ecommerce_service import EcommerceService

logger = logging.getLogger("defai.api.ecommerce")
router = APIRouter(prefix="/api/ecommerce", tags=["E-Commerce"])

@router.get("/products")
def list_products(
    query: Optional[str] = Query(None, description="Search keyword for product title or category"),
    merchant: Optional[str] = Query(None, description="Filter by merchant (Amazon, Flipkart)"),
    db: Session = Depends(get_db)
):
    """
    Returns live verified product catalog items from supported e-commerce sources.
    """
    EcommerceService.ensure_catalog_seeded(db)
    q = db.query(ProductCatalog)
    if merchant:
        q = q.filter(ProductCatalog.merchant.ilike(f"%{merchant}%"))
    if query:
        q = q.filter(ProductCatalog.title.ilike(f"%{query}%"))

    products = q.all()
    return [
        {
            "id": p.id,
            "merchant": p.merchant,
            "sku": p.sku,
            "title": p.title,
            "category": p.category,
            "price_paise": p.price_paise,
            "price_inr": p.price_paise / 100.0,
            "currency": p.currency,
            "in_stock": p.in_stock,
            "stock_count": p.stock_count,
            "source_url": p.source_url,
            "last_checked_at": p.last_checked_at.isoformat() if p.last_checked_at else None
        }
        for p in products
    ]

@router.get("/stock-check")
def check_product_stock(
    query: Optional[str] = Query(None),
    sku: Optional[str] = Query(None),
    merchant: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    """
    Performs real-time stock and price check for a specified product query or SKU.
    """
    in_stock, product, status_msg = EcommerceService.check_stock_and_price(
        db=db,
        sku=sku,
        query=query,
        merchant=merchant
    )

    if not product:
        raise HTTPException(status_code=404, detail="Product not found in authorized catalog")

    return {
        "status": status_msg,
        "in_stock": in_stock,
        "sku": product.sku,
        "merchant": product.merchant,
        "title": product.title,
        "price_paise": product.price_paise,
        "price_inr": product.price_paise / 100.0,
        "currency": product.currency,
        "stock_count": product.stock_count
    }

@router.get("/alerts")
def list_stock_alerts(user_id: str = "user_1", db: Session = Depends(get_db)):
    """
    Returns all monitored out-of-stock items that DeFAI Sentinel is tracking for the user.
    """
    alerts = EcommerceService.list_active_alerts(db, user_id)
    return [
        {
            "id": a.id,
            "merchant": a.merchant,
            "product_title": a.product_title,
            "sku": a.sku,
            "status": a.status,
            "created_at": a.created_at.isoformat() if a.created_at else None
        }
        for a in alerts
    ]

@router.get("/live-price")
async def get_live_product_price(
    query: str = Query(..., description="Product search query"),
    merchant: Optional[str] = Query("Amazon", description="Target e-commerce store (Amazon, Flipkart, Myntra)"),
    url: Optional[str] = Query(None, description="Direct product URL if available")
):
    """
    Scrapes real-time market price and title directly from Amazon, Flipkart, or Myntra.
    """
    from app.services.live_ecommerce_scraper import LiveEcommerceScraperService
    data = await LiveEcommerceScraperService.fetch_live_price(merchant=merchant or "Amazon", query=query, product_url=url)
    return data

@router.post("/sync-price/{tx_id}")
async def sync_transaction_live_price(
    tx_id: str,
    db: Session = Depends(get_db)
):
    """
    Fetches real-time market price for the transaction's product and updates the transaction record.
    """
    import json
    from app.models.financial import Transaction
    from app.services.live_ecommerce_scraper import LiveEcommerceScraperService
    from app.services.policy_engine import DeterministicPolicyEngine
    from app.schemas.intent import StructuredIntent

    tx = db.query(Transaction).filter(Transaction.id == tx_id).first()
    if not tx:
        raise HTTPException(status_code=404, detail="Transaction not found")

    merchant = tx.merchant or "Amazon"
    query = tx.user_message or "NVIDIA RTX 5090"

    live_res = await LiveEcommerceScraperService.fetch_live_price(merchant=merchant, query=query)
    if not live_res.get("success") or not live_res.get("price_paise"):
        raise HTTPException(status_code=502, detail="Failed to scrape live price from merchant")

    new_price_paise = live_res["price_paise"]
    tx.amount_paise = new_price_paise

    # Update intent_json
    if tx.intent_json:
        try:
            intent_dict = json.loads(tx.intent_json)
            intent_dict["amount_paise"] = new_price_paise
            intent_dict["merchant"] = live_res.get("merchant", tx.merchant)
            tx.intent_json = json.dumps(intent_dict)

            # Re-evaluate policy with new real price
            intent_obj = StructuredIntent.model_validate(intent_dict)
            decision, reasons, _ = DeterministicPolicyEngine.evaluate(db, intent_obj, tx.user_id or "user_1")
            tx.policy_decision = decision
            tx.policy_reasons = json.dumps(reasons)
            if decision == "BLOCK":
                tx.status = "BLOCKED"
                tx.failure_reason = "; ".join(reasons)
            elif decision == "REQUIRE_APPROVAL":
                tx.status = "REQUIRES_APPROVAL"
        except Exception as e:
            logger.warning(f"Error updating intent/policy during price sync: {e}")

    db.commit()
    db.refresh(tx)

    return {
        "success": True,
        "transaction_id": tx.id,
        "amount_paise": tx.amount_paise,
        "amount_inr": tx.amount_paise / 100.0,
        "merchant": tx.merchant,
        "product_title": live_res.get("product_title"),
        "status": tx.status,
        "policy_decision": tx.policy_decision
    }

@router.post("/set-price/{tx_id}")
def set_transaction_custom_price(
    tx_id: str,
    amount_inr: float = Query(..., description="Custom price in INR"),
    db: Session = Depends(get_db)
):
    """
    Allows user to explicitly confirm or set the verified product price from their Amazon/Flipkart check.
    """
    import json
    from app.models.financial import Transaction
    from app.services.policy_engine import DeterministicPolicyEngine
    from app.schemas.intent import StructuredIntent

    tx = db.query(Transaction).filter(Transaction.id == tx_id).first()
    if not tx:
        raise HTTPException(status_code=404, detail="Transaction not found")

    new_paise = int(round(amount_inr * 100))
    tx.amount_paise = new_paise

    if tx.intent_json:
        try:
            intent_dict = json.loads(tx.intent_json)
            intent_dict["amount_paise"] = new_paise
            tx.intent_json = json.dumps(intent_dict)

            intent_obj = StructuredIntent.model_validate(intent_dict)
            decision, reasons, _ = DeterministicPolicyEngine.evaluate(db, intent_obj, tx.user_id or "user_1")
            tx.policy_decision = decision
            tx.policy_reasons = json.dumps(reasons)
            if decision == "BLOCK":
                tx.status = "BLOCKED"
                tx.failure_reason = "; ".join(reasons)
            elif decision == "REQUIRE_APPROVAL":
                tx.status = "REQUIRES_APPROVAL"
        except Exception as e:
            logger.warning(f"Error setting custom price: {e}")

    db.commit()
    db.refresh(tx)

    return {
        "success": True,
        "transaction_id": tx.id,
        "amount_paise": tx.amount_paise,
        "amount_inr": tx.amount_paise / 100.0,
        "status": tx.status
    }


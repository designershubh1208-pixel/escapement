import asyncio
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import get_engine, Base
from app.models import *  # Import all models to register with Base.metadata
from app.api import (
    chat_router,
    requests_router,
    policies_router,
    approvals_router,
    audit_router,
    security_router,
    mock_bank_router,
    subscriptions_router,
    tickets_router,
    payments_router,
    webhooks_router,
    ecommerce_router,
    session_keys_router,
    auth_router
)
from app.services.background_worker import run_durable_background_worker

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("defai.main")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize tables
    logger.info("Initializing database schemas...")
    try:
        engine = get_engine()
        Base.metadata.create_all(bind=engine)
        
        # Self-healing column migration for existing databases
        with engine.connect() as conn:
            try:
                from sqlalchemy import inspect, text
                inspector = inspect(engine)
                existing_cols = [c["name"] for c in inspector.get_columns("users")]
                if "phone_number" not in existing_cols:
                    conn.execute(text("ALTER TABLE users ADD COLUMN phone_number VARCHAR(32)"))
                if "password_hash" not in existing_cols:
                    conn.execute(text("ALTER TABLE users ADD COLUMN password_hash VARCHAR(255)"))
                if "is_verified" not in existing_cols:
                    conn.execute(text("ALTER TABLE users ADD COLUMN is_verified BOOLEAN DEFAULT 0"))
                conn.commit()
            except Exception as mig_err:
                logger.warning(f"Column check notice: {mig_err}")
                
        logger.info("Database schemas initialized.")
    except Exception as e:
        logger.error(f"Schema creation error: {e}")

    # Launch durable background worker
    worker_task = asyncio.create_task(run_durable_background_worker())
    yield
    worker_task.cancel()
    try:
        await worker_task
    except asyncio.CancelledError:
        pass

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Autonomous and Secure Economic Agent - Deterministic Authorization Engine",
    lifespan=lifespan
)

# CORS Middleware (supports existing React/Vite development server)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount all API routers
app.include_router(chat_router)
app.include_router(requests_router)
app.include_router(policies_router)
app.include_router(approvals_router)
app.include_router(audit_router)
app.include_router(security_router)
app.include_router(mock_bank_router)
app.include_router(subscriptions_router)
app.include_router(tickets_router)
app.include_router(payments_router)
app.include_router(webhooks_router)
app.include_router(ecommerce_router)
app.include_router(session_keys_router)
app.include_router(auth_router)

@app.get("/health", tags=["Health"])
@app.get("/api/health", tags=["Health"])
def health_check():
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "mode": "deterministic_authorization",
        "environment": settings.ENVIRONMENT,
        "payment_mode": settings.PAYMENT_MODE
    }

@app.get("/api/health/deep", tags=["Health"])
def deep_health_check():
    """Comprehensive readiness audit checking MySQL, payment gateway, e-commerce, and EVM status."""
    db_ok = False
    try:
        engine = get_engine()
        with engine.connect() as conn:
            conn.execute(Base.metadata.tables["users"].select().limit(1))
        db_ok = True
    except Exception as e:
        logger.error(f"Deep health DB error: {e}")

    return {
        "status": "healthy" if db_ok else "degraded",
        "database": {
            "type": "mysql",
            "connected": db_ok
        },
        "payment_gateway": {
            "mode": settings.PAYMENT_MODE,
            "allow_live_payments": settings.ALLOW_LIVE_PAYMENTS,
            "razorpay_configured": bool(settings.RAZORPAY_KEY_ID and settings.RAZORPAY_KEY_SECRET),
            "webhook_secret_set": bool(settings.RAZORPAY_WEBHOOK_SECRET)
        },
        "ecommerce": {
            "provider": settings.ECOMMERCE_PROVIDER
        },
        "blockchain": {
            "rpc_url": settings.EVM_RPC_URL,
            "contract": settings.DEFAI_POLICY_CONTRACT_ADDRESS
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host=settings.HOST, port=settings.PORT, reload=settings.DEBUG)

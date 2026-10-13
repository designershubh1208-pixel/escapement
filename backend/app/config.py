import os
from typing import Optional
from pydantic import model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

BACKEND_ENV_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".env"))

class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=[BACKEND_ENV_PATH, ".env"],
        env_file_encoding="utf-8",
        extra="ignore"
    )

    PROJECT_NAME: str = "DeFAI Sentinel"
    VERSION: str = "1.0.0"
    API_PREFIX: str = "/api"
    
    # Host & Port
    HOST: str = "127.0.0.1"
    PORT: int = 5001
    DEBUG: bool = True
    
    # Database
    DATABASE_URL: Optional[str] = "mysql+pymysql://root:YOUR_PASSWORD_HERE@localhost:3306/defai_sentinel"
    FALLBACK_SQLITE_URL: str = f"sqlite:///{os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'defai_sentinel.db')).replace(chr(92), '/')}"
    
    # AI Engine (Ollama / Local LLM)
    OLLAMA_BASE_URL: str = "http://localhost:11434/v1"
    OLLAMA_API_KEY: str = "ollama"
    OLLAMA_MODEL: str = "richardyoung/qwen2.5-14b-instruct-abliterated"
    AI_TIMEOUT_SECONDS: int = 60
    
    # Blockchain / EVM Configuration
    EVM_RPC_URL: str = "http://127.0.0.1:8545"
    DEFAI_POLICY_CONTRACT_ADDRESS: str = "0x5FbDB2315678afecb367f032d93F642f64180aa3"
    AGENT_WALLET_ADDRESS: str = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8"
    USER_WALLET_ADDRESS: str = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"

    # Environment Separation (development, sandbox, production)
    ENVIRONMENT: str = "sandbox"

    # Payment Gateway Configuration (INR-First)
    PAYMENT_MODE: str = "sandbox"  # "mock", "sandbox", "live"
    ALLOW_LIVE_PAYMENTS: bool = False  # Strictly False by default; real money blocked
    RAZORPAY_KEY_ID: Optional[str] = None
    RAZORPAY_KEY_SECRET: Optional[str] = None
    RAZORPAY_WEBHOOK_SECRET: Optional[str] = "whsec_defai_sentinel_sandbox_test"

    # E-Commerce Product Data Configuration
    ECOMMERCE_PROVIDER: str = "authorized_catalog"  # "mock", "authorized_catalog", "live_api"
    ECOMMERCE_API_KEY: Optional[str] = None
    ECOMMERCE_API_ENDPOINT: Optional[str] = None

    # Auth & Security Configuration (JWT & Mobile OTP)
    JWT_SECRET_KEY: str = "defai_sentinel_super_secret_jwt_key_2026_x89f"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    OTP_EXPIRE_MINUTES: int = 10
    TWILIO_ACCOUNT_SID: Optional[str] = None
    TWILIO_AUTH_TOKEN: Optional[str] = None
    TWILIO_FROM_NUMBER: Optional[str] = None
    FAST2SMS_API_KEY: Optional[str] = None

    # SMTP / Email Configuration (Free Email OTP)
    SMTP_HOST: str = "smtp.gmail.com"
    SMTP_PORT: int = 587
    SMTP_USER: Optional[str] = None
    SMTP_PASSWORD: Optional[str] = None
    SMTP_FROM_EMAIL: Optional[str] = None

    # OAuth Configuration (Google & GitHub)
    GOOGLE_CLIENT_ID: Optional[str] = None
    GOOGLE_CLIENT_SECRET: Optional[str] = None
    GOOGLE_REDIRECT_URI: str = "http://localhost:5001/api/auth/google/callback"
    GITHUB_CLIENT_ID: Optional[str] = None
    GITHUB_CLIENT_SECRET: Optional[str] = None
    GITHUB_REDIRECT_URI: str = "http://localhost:5001/api/auth/github/callback"
    FRONTEND_URL: str = "http://localhost:3000"

    @model_validator(mode="after")
    def validate_payment_mode(self):
        """Enforces fail-closed guardrails around live payment execution."""
        if self.PAYMENT_MODE == "live" and not self.ALLOW_LIVE_PAYMENTS:
            raise ValueError(
                "CRITICAL SECURITY ERROR: PAYMENT_MODE is set to 'live' but ALLOW_LIVE_PAYMENTS is False! "
                "Real payments are disabled until compliance, onboarding, and merchant verification are complete."
            )
        return self

settings = Settings()

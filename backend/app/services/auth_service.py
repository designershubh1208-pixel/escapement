import logging
import uuid
import bcrypt
import jwt
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
from sqlalchemy.orm import Session
from app.config import settings
from app.models.user import User
from app.services.sms_service import SMSService
from app.services.mock_payment import MockPaymentExecutor
from app.services.subscription_service import SubscriptionService

logger = logging.getLogger("defai.auth")

class AuthService:
    @staticmethod
    def hash_password(password: str) -> str:
        """Hashes a password using bcrypt."""
        salt = bcrypt.gensalt()
        return bcrypt.hashpw(password.encode("utf-8"), salt).decode("utf-8")

    @staticmethod
    def verify_password(plain_password: str, hashed_password: str) -> bool:
        """Verifies a plain password against a bcrypt hash."""
        if not hashed_password:
            return False
        try:
            return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))
        except Exception:
            return False

    @staticmethod
    def create_access_token(data: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
        """Creates a signed JWT access token."""
        to_encode = data.copy()
        expire = datetime.utcnow() + (expires_delta or timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES))
        to_encode.update({"exp": expire, "iat": datetime.utcnow()})
        encoded_jwt = jwt.encode(to_encode, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)
        return encoded_jwt

    @staticmethod
    def decode_access_token(token: str) -> Optional[Dict[str, Any]]:
        """Decodes and validates a JWT access token."""
        try:
            payload = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
            return payload
        except jwt.ExpiredSignatureError:
            logger.warning("JWT Token expired")
            return None
        except jwt.PyJWTError as e:
            logger.warning(f"Invalid JWT Token: {e}")
            return None

    @classmethod
    def resolve_user_id(cls, db: Session, authorization: Optional[str] = None, fallback_id: Optional[str] = None) -> str:
        """Extracts and verifies user identity from Bearer token, or returns fallback."""
        if isinstance(authorization, str) and authorization.startswith("Bearer "):
            token = authorization.split(" ")[1]
            payload = cls.decode_access_token(token)
            if payload and "sub" in payload:
                auth_user = cls.get_user_by_id(db, payload["sub"])
                if auth_user:
                    return auth_user.id
        return fallback_id or "user_1"

    @classmethod
    def get_user_by_id(cls, db: Session, user_id: str) -> Optional[User]:
        return db.query(User).filter(User.id == user_id).first()

    @classmethod
    def get_user_by_phone(cls, db: Session, phone_number: str) -> Optional[User]:
        norm_phone = SMSService.normalize_phone_number(phone_number)
        return db.query(User).filter(User.phone_number == norm_phone).first()

    @classmethod
    def get_user_by_email(cls, db: Session, email: str) -> Optional[User]:
        return db.query(User).filter(User.email == email.strip().lower()).first()

    @classmethod
    def ensure_user_environment(cls, db: Session, user_id: str) -> None:
        """Initializes account environment for a user without mock data."""
        try:
            MockPaymentExecutor.get_or_create_account(db, user_id)
        except Exception as e:
            logger.warning(f"Could not initialize user environment for {user_id}: {e}")

    @classmethod
    def create_user(
        cls, 
        db: Session, 
        phone_number: Optional[str] = None, 
        name: Optional[str] = None, 
        email: Optional[str] = None,
        password: Optional[str] = None,
        is_verified: bool = False
    ) -> User:
        """Creates a new user record and sets up their financial sandbox environment."""
        user_id = f"usr_{uuid.uuid4().hex[:12]}"
        norm_phone = SMSService.normalize_phone_number(phone_number) if phone_number else None
        norm_email = email.strip().lower() if email else None
        pwd_hash = cls.hash_password(password) if password else None

        user = User(
            id=user_id,
            phone_number=norm_phone,
            name=name or (f"User {norm_phone[-4:]}" if norm_phone else "Sentinel User"),
            email=norm_email,
            password_hash=pwd_hash,
            is_verified=is_verified
        )
        db.add(user)
        db.commit()
        db.refresh(user)

        cls.ensure_user_environment(db, user.id)
        logger.info(f"Created new user {user.id} ({user.phone_number or user.email})")
        return user

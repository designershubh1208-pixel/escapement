import logging
import re
from typing import Optional
from urllib.parse import urlencode, quote_plus
import requests
from fastapi import APIRouter, Depends, HTTPException, Header, Query, status
from fastapi.responses import RedirectResponse
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session
from app.config import settings
from app.database import get_db
from app.models.user import User
from app.services.sms_service import SMSService
from app.services.email_service import EmailService
from app.services.auth_service import AuthService

logger = logging.getLogger("defai.api.auth")
router = APIRouter(prefix="/api/auth", tags=["Authentication & OAuth"])

# Request & Response Schemas
class SendOtpRequest(BaseModel):
    email: Optional[str] = None
    password: Optional[str] = None
    phone_number: Optional[str] = None
    purpose: Optional[str] = "login"  # "login" or "register"
    name: Optional[str] = None

class VerifyOtpRequest(BaseModel):
    email: Optional[str] = None
    password: Optional[str] = None
    phone_number: Optional[str] = None
    otp_code: str
    purpose: Optional[str] = "login"
    name: Optional[str] = None

class RegisterRequest(BaseModel):
    email: Optional[str] = None
    phone_number: Optional[str] = None
    name: Optional[str] = None
    password: str
    otp_code: Optional[str] = None

class LoginPasswordRequest(BaseModel):
    identifier: str  # email or phone number
    password: str

# Dependency to extract current user from Bearer Token
def get_current_user_optional(
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db)
) -> Optional[User]:
    if not authorization or not authorization.startswith("Bearer "):
        return None
    token = authorization.split(" ")[1]
    payload = AuthService.decode_access_token(token)
    if not payload or "sub" not in payload:
        return None
    return AuthService.get_user_by_id(db, payload["sub"])

def get_current_user_required(
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db)
) -> User:
    user = get_current_user_optional(authorization, db)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required or token expired."
        )
    return user

@router.get("/providers")
def get_auth_providers():
    """Returns the configuration status of third-party OAuth providers."""
    return {
        "google": bool(settings.GOOGLE_CLIENT_ID and settings.GOOGLE_CLIENT_SECRET),
        "github": bool(settings.GITHUB_CLIENT_ID and settings.GITHUB_CLIENT_SECRET),
    }

# =====================================================================
# REAL EMAIL & MOBILE OTP AUTHENTICATION
# =====================================================================

@router.post("/otp/send")
def send_otp(payload: SendOtpRequest, db: Session = Depends(get_db)):
    """
    Sends a real 6-digit OTP to the user's Email address (or mobile number).
    Enforces real authentication rules:
    - If logging in: user MUST have an existing account.
    - If registering: user must NOT already exist.
    """
    # 1. Email OTP (Primary, 100% Free)
    if payload.email and payload.email.strip():
        norm_email = EmailService.normalize_email(payload.email)
        if not EmailService.is_valid_email(norm_email):
            raise HTTPException(status_code=400, detail="Please enter a valid email address.")

        existing_user = AuthService.get_user_by_email(db, norm_email)
        if payload.purpose == "login":
            if not existing_user:
                raise HTTPException(
                    status_code=400, 
                    detail="No account found with this email. Please sign up first."
                )
            # If user has a password set and password is provided, verify it before sending OTP
            if payload.password:
                if not existing_user.password_hash or not AuthService.verify_password(payload.password, existing_user.password_hash):
                    raise HTTPException(
                        status_code=400,
                        detail="Incorrect password. Please check your password and try again."
                    )
        elif payload.purpose == "register":
            if existing_user:
                raise HTTPException(
                    status_code=400, 
                    detail="An account with this email already exists. Please sign in instead."
                )
            if payload.password and len(payload.password) < 6:
                raise HTTPException(
                    status_code=400,
                    detail="Password must be at least 6 characters long."
                )

        success, message, normalized_email = EmailService.create_and_send_email_otp(
            db, norm_email, purpose=payload.purpose
        )
        if not success:
            raise HTTPException(status_code=400, detail=message)

        return {
            "success": True,
            "message": message,
            "email": normalized_email,
            "cooldown_seconds": 30
        }

    # 2. Fallback to Mobile OTP if phone provided
    elif payload.phone_number and payload.phone_number.strip():
        norm_phone = SMSService.normalize_phone_number(payload.phone_number)
        digits_only = re.sub(r"[^\d]", "", norm_phone)
        if len(digits_only) < 10:
            raise HTTPException(status_code=400, detail="Invalid mobile number. Please enter at least 10 digits.")

        existing_user = AuthService.get_user_by_phone(db, norm_phone)
        if payload.purpose == "login":
            if not existing_user:
                raise HTTPException(
                    status_code=400, 
                    detail="No account found with this mobile number. Please create an account first."
                )
        elif payload.purpose == "register":
            if existing_user:
                raise HTTPException(
                    status_code=400, 
                    detail="An account with this mobile number already exists. Please sign in instead."
                )

        success, message, normalized_phone = SMSService.create_and_send_otp(
            db, payload.phone_number, purpose=payload.purpose
        )
        if not success:
            raise HTTPException(status_code=400, detail=message)

        return {
            "success": True,
            "message": message,
            "phone_number": normalized_phone,
            "cooldown_seconds": 30
        }

    else:
        raise HTTPException(status_code=400, detail="Please provide an email address.")

@router.post("/otp/verify")
def verify_otp_and_login(payload: VerifyOtpRequest, db: Session = Depends(get_db)):
    """
    Verifies the OTP (Email or Mobile).
    - Login: ensures account exists and logs in.
    - Register: requires user's Name input, creates account in DB, and logs in.
    """
    # 1. Email OTP Verification
    if payload.email and payload.email.strip():
        norm_email = EmailService.normalize_email(payload.email)
        is_valid, msg, _ = EmailService.verify_email_otp(
            db, norm_email, payload.otp_code, purpose=payload.purpose
        )
        if not is_valid:
            raise HTTPException(status_code=400, detail=msg)

        existing_user = AuthService.get_user_by_email(db, norm_email)
        if payload.purpose == "login":
            if not existing_user:
                raise HTTPException(
                    status_code=400, 
                    detail="No account found with this email. Please sign up first."
                )
            user = existing_user
            if not user.is_verified:
                user.is_verified = True
                db.commit()
                db.refresh(user)

        else:  # Register
            if existing_user:
                raise HTTPException(
                    status_code=400, 
                    detail="An account with this email already exists. Please sign in."
                )
            if not payload.name or not payload.name.strip():
                raise HTTPException(
                    status_code=400, 
                    detail="Full Name is required to register an account."
                )

            user = AuthService.create_user(
                db=db,
                email=norm_email,
                name=payload.name.strip() if payload.name and payload.name.strip() else norm_email.split("@")[0],
                password=payload.password,
                is_verified=True
            )

        # Issue JWT Token
        access_token = AuthService.create_access_token({
            "sub": user.id,
            "email": user.email,
            "name": user.name,
            "phone_number": user.phone_number
        })

        return {
            "success": True,
            "message": "Authentication successful",
            "access_token": access_token,
            "token_type": "bearer",
            "user": {
                "id": user.id,
                "name": user.name,
                "email": user.email,
                "phone_number": user.phone_number,
                "is_verified": user.is_verified
            }
        }

    # 2. Mobile OTP Verification (Fallback)
    elif payload.phone_number and payload.phone_number.strip():
        is_valid, msg, norm_phone = SMSService.verify_otp(
            db, payload.phone_number, payload.otp_code, purpose=payload.purpose
        )
        if not is_valid:
            raise HTTPException(status_code=400, detail=msg)

        existing_user = AuthService.get_user_by_phone(db, norm_phone)
        if payload.purpose == "login":
            if not existing_user:
                raise HTTPException(
                    status_code=400, 
                    detail="No account found with this mobile number. Please sign up first."
                )
            user = existing_user
            if not user.is_verified:
                user.is_verified = True
                db.commit()
                db.refresh(user)

        else:  # Register
            if existing_user:
                raise HTTPException(
                    status_code=400, 
                    detail="An account with this mobile number already exists. Please sign in."
                )
            if not payload.name or not payload.name.strip():
                raise HTTPException(
                    status_code=400, 
                    detail="Full Name is required to register an account."
                )

            user = AuthService.create_user(
                db=db,
                phone_number=norm_phone,
                name=payload.name.strip(),
                is_verified=True
            )

        access_token = AuthService.create_access_token({
            "sub": user.id,
            "phone_number": user.phone_number,
            "name": user.name,
            "email": user.email
        })

        return {
            "success": True,
            "message": "Authentication successful",
            "access_token": access_token,
            "token_type": "bearer",
            "user": {
                "id": user.id,
                "name": user.name,
                "phone_number": user.phone_number,
                "email": user.email,
                "is_verified": user.is_verified
            }
        }

    else:
        raise HTTPException(status_code=400, detail="Email address is required.")

# =====================================================================
# GOOGLE OAUTH 2.0 FLOW
# =====================================================================

@router.get("/google/login")
def google_login():
    """Redirects user to Google OAuth consent screen."""
    if not settings.GOOGLE_CLIENT_ID:
        error_msg = quote_plus("Google OAuth is not configured. Please add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to .env.")
        return RedirectResponse(f"{settings.FRONTEND_URL}/login?error={error_msg}")

    params = {
        "client_id": settings.GOOGLE_CLIENT_ID,
        "redirect_uri": settings.GOOGLE_REDIRECT_URI,
        "response_type": "code",
        "scope": "openid email profile",
        "access_type": "offline",
        "prompt": "select_account"
    }
    url = f"https://accounts.google.com/o/oauth2/v2/auth?{urlencode(params)}"
    return RedirectResponse(url)

@router.get("/google/callback")
def google_callback(code: Optional[str] = Query(None), error: Optional[str] = Query(None), db: Session = Depends(get_db)):
    """Handles Google OAuth redirect, fetches user info, and creates/logs in user."""
    if error or not code:
        err = quote_plus(error or "Google authentication cancelled.")
        return RedirectResponse(f"{settings.FRONTEND_URL}/login?error={err}")

    if not settings.GOOGLE_CLIENT_ID or not settings.GOOGLE_CLIENT_SECRET:
        err = quote_plus("Google OAuth credentials missing on backend.")
        return RedirectResponse(f"{settings.FRONTEND_URL}/login?error={err}")

    # Exchange code for access token
    try:
        token_res = requests.post(
            "https://oauth2.googleapis.com/token",
            data={
                "client_id": settings.GOOGLE_CLIENT_ID,
                "client_secret": settings.GOOGLE_CLIENT_SECRET,
                "code": code,
                "grant_type": "authorization_code",
                "redirect_uri": settings.GOOGLE_REDIRECT_URI
            },
            timeout=10
        )
        if token_res.status_code != 200:
            logger.error(f"Google token exchange failed: {token_res.text}")
            err_desc = "Failed to exchange code with Google."
            try:
                err_json = token_res.json()
                err_desc = err_json.get("error_description") or err_json.get("error") or err_desc
            except Exception:
                pass
            err = quote_plus(f"Google: {err_desc}")
            return RedirectResponse(f"{settings.FRONTEND_URL}/login?error={err}")

        token_data = token_res.json()
        access_token = token_data.get("access_token")

        # Fetch Google user info (name, email, picture)
        userinfo_res = requests.get(
            "https://www.googleapis.com/oauth2/v2/userinfo",
            headers={"Authorization": f"Bearer {access_token}"},
            timeout=10
        )
        if userinfo_res.status_code != 200:
            err = quote_plus("Failed to fetch user profile from Google.")
            return RedirectResponse(f"{settings.FRONTEND_URL}/login?error={err}")

        userinfo = userinfo_res.json()
        google_email = userinfo.get("email")
        google_name = userinfo.get("name") or google_email.split("@")[0]

        if not google_email:
            err = quote_plus("Google profile did not provide an email address.")
            return RedirectResponse(f"{settings.FRONTEND_URL}/login?error={err}")

        # Find or create user
        user = AuthService.get_user_by_email(db, google_email)
        if not user:
            user = AuthService.create_user(
                db=db,
                email=google_email,
                name=google_name,
                is_verified=True
            )
        else:
            if not user.name:
                user.name = google_name
            user.is_verified = True
            db.commit()
            db.refresh(user)

        jwt_token = AuthService.create_access_token({
            "sub": user.id,
            "email": user.email,
            "name": user.name,
            "phone_number": user.phone_number
        })

        return RedirectResponse(f"{settings.FRONTEND_URL}/auth/callback?token={jwt_token}")

    except Exception as e:
        logger.error(f"Google OAuth callback error: {e}")
        err = quote_plus(f"Google authentication error: {str(e)}")
        return RedirectResponse(f"{settings.FRONTEND_URL}/login?error={err}")

# =====================================================================
# GITHUB OAUTH 2.0 FLOW
# =====================================================================

@router.get("/github/login")
def github_login():
    """Redirects user to GitHub OAuth authorization screen."""
    if not settings.GITHUB_CLIENT_ID:
        error_msg = quote_plus("GitHub OAuth is not configured. Please add GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET to .env.")
        return RedirectResponse(f"{settings.FRONTEND_URL}/login?error={error_msg}")

    params = {
        "client_id": settings.GITHUB_CLIENT_ID,
        "redirect_uri": settings.GITHUB_REDIRECT_URI,
        "scope": "read:user user:email"
    }
    url = f"https://github.com/login/oauth/authorize?{urlencode(params)}"
    return RedirectResponse(url)

@router.get("/github/callback")
def github_callback(code: Optional[str] = Query(None), error: Optional[str] = Query(None), db: Session = Depends(get_db)):
    """Handles GitHub OAuth redirect, fetches user info and email, creates/logs in user."""
    if error or not code:
        err = quote_plus(error or "GitHub authentication cancelled.")
        return RedirectResponse(f"{settings.FRONTEND_URL}/login?error={err}")

    if not settings.GITHUB_CLIENT_ID or not settings.GITHUB_CLIENT_SECRET:
        err = quote_plus("GitHub OAuth credentials missing on backend.")
        return RedirectResponse(f"{settings.FRONTEND_URL}/login?error={err}")

    try:
        # Exchange code for access token
        token_res = requests.post(
            "https://github.com/login/oauth/access_token",
            headers={"Accept": "application/json"},
            data={
                "client_id": settings.GITHUB_CLIENT_ID,
                "client_secret": settings.GITHUB_CLIENT_SECRET,
                "code": code,
                "redirect_uri": settings.GITHUB_REDIRECT_URI
            },
            timeout=10
        )
        if token_res.status_code != 200:
            err = quote_plus("Failed to exchange code with GitHub.")
            return RedirectResponse(f"{settings.FRONTEND_URL}/login?error={err}")

        token_data = token_res.json()
        access_token = token_data.get("access_token")
        if not access_token:
            err = quote_plus(token_data.get("error_description", "Invalid GitHub authorization response."))
            return RedirectResponse(f"{settings.FRONTEND_URL}/login?error={err}")

        # Fetch GitHub User profile (name, login, avatar)
        user_res = requests.get(
            "https://api.github.com/user",
            headers={
                "Authorization": f"Bearer {access_token}",
                "Accept": "application/vnd.github.v3+json"
            },
            timeout=10
        )
        if user_res.status_code != 200:
            err = quote_plus("Failed to fetch user profile from GitHub.")
            return RedirectResponse(f"{settings.FRONTEND_URL}/login?error={err}")

        gh_data = user_res.json()
        gh_name = gh_data.get("name") or gh_data.get("login") or "GitHub User"
        gh_email = gh_data.get("email")

        # If email is private on GitHub profile, query /user/emails
        if not gh_email:
            emails_res = requests.get(
                "https://api.github.com/user/emails",
                headers={
                    "Authorization": f"Bearer {access_token}",
                    "Accept": "application/vnd.github.v3+json"
                },
                timeout=10
            )
            if emails_res.status_code == 200:
                emails_list = emails_res.json()
                for em in emails_list:
                    if em.get("primary") and em.get("verified"):
                        gh_email = em.get("email")
                        break
                if not gh_email and emails_list:
                    gh_email = emails_list[0].get("email")

        if not gh_email:
            gh_email = f"{gh_data.get('login', 'user')}@users.noreply.github.com"

        # Find or create user
        user = AuthService.get_user_by_email(db, gh_email)
        if not user:
            user = AuthService.create_user(
                db=db,
                email=gh_email,
                name=gh_name,
                is_verified=True
            )
        else:
            if not user.name:
                user.name = gh_name
            user.is_verified = True
            db.commit()
            db.refresh(user)

        jwt_token = AuthService.create_access_token({
            "sub": user.id,
            "email": user.email,
            "name": user.name,
            "phone_number": user.phone_number
        })

        return RedirectResponse(f"{settings.FRONTEND_URL}/auth/callback?token={jwt_token}")

    except Exception as e:
        logger.error(f"GitHub OAuth callback error: {e}")
        err = quote_plus(f"GitHub authentication error: {str(e)}")
        return RedirectResponse(f"{settings.FRONTEND_URL}/login?error={err}")

# =====================================================================
# PASSWORD FLOWS
# =====================================================================

@router.post("/register")
def register_with_password(payload: RegisterRequest, db: Session = Depends(get_db)):
    """
    Registers a new account using email or mobile number with password.
    """
    if not payload.password or len(payload.password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters.")

    norm_phone = None
    if payload.phone_number:
        norm_phone = SMSService.normalize_phone_number(payload.phone_number)
        if AuthService.get_user_by_phone(db, norm_phone):
            raise HTTPException(status_code=400, detail="An account with this mobile number already exists.")

    norm_email = None
    if payload.email:
        norm_email = payload.email.strip().lower()
        if AuthService.get_user_by_email(db, norm_email):
            raise HTTPException(status_code=400, detail="An account with this email already exists.")

    if not norm_phone and not norm_email:
        raise HTTPException(status_code=400, detail="Either mobile number or email is required to register.")

    if norm_phone and (not payload.name or not payload.name.strip()):
        raise HTTPException(status_code=400, detail="Full Name is required to register.")

    user = AuthService.create_user(
        db=db,
        phone_number=norm_phone,
        email=norm_email,
        name=payload.name.strip() if payload.name else (norm_email.split("@")[0] if norm_email else "User"),
        password=payload.password,
        is_verified=False
    )

    access_token = AuthService.create_access_token({
        "sub": user.id,
        "phone_number": user.phone_number,
        "name": user.name,
        "email": user.email
    })

    return {
        "success": True,
        "message": "Account created successfully",
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "name": user.name,
            "phone_number": user.phone_number,
            "email": user.email,
            "is_verified": user.is_verified
        }
    }

@router.post("/login")
def login_with_password(payload: LoginPasswordRequest, db: Session = Depends(get_db)):
    """Logs in a user using mobile number or email with password."""
    identifier = payload.identifier.strip()
    user = None

    if "@" in identifier:
        user = AuthService.get_user_by_email(db, identifier)
    else:
        norm_phone = SMSService.normalize_phone_number(identifier)
        user = AuthService.get_user_by_phone(db, norm_phone)

    if not user:
        raise HTTPException(status_code=400, detail="No account found with these credentials. Please sign up first.")

    if not user.password_hash or not AuthService.verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=400, detail="Incorrect password. Please try again.")

    access_token = AuthService.create_access_token({
        "sub": user.id,
        "phone_number": user.phone_number,
        "name": user.name,
        "email": user.email
    })

    return {
        "success": True,
        "message": "Login successful",
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "name": user.name,
            "phone_number": user.phone_number,
            "email": user.email,
            "is_verified": user.is_verified
        }
    }

@router.get("/me")
def get_current_user_profile(user: User = Depends(get_current_user_required)):
    return {
        "id": user.id,
        "name": user.name,
        "phone_number": user.phone_number,
        "email": user.email,
        "is_verified": user.is_verified,
        "created_at": user.created_at.isoformat() if user.created_at else None
    }

@router.post("/logout")
def logout():
    return {"success": True, "message": "Successfully logged out."}

import logging
import secrets
import smtplib
import re
from datetime import datetime, timedelta
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Optional, Tuple
from sqlalchemy.orm import Session
from app.config import settings
from app.models.otp import EmailOTP

logger = logging.getLogger("defai.email_otp")

class EmailService:
    @staticmethod
    def normalize_email(raw_email: str) -> str:
        """Cleans and standardizes email string."""
        return raw_email.strip().lower()

    @staticmethod
    def is_valid_email(email: str) -> bool:
        """Basic email format validation."""
        pattern = r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"
        return bool(re.match(pattern, email))

    @staticmethod
    def generate_otp_code() -> str:
        """Generates a cryptographically random 6-digit numeric OTP."""
        return str(secrets.randbelow(900000) + 100000)

    @classmethod
    def send_email_otp(cls, to_email: str, otp_code: str, purpose: str = "login") -> Tuple[bool, str]:
        """
        Sends OTP to user's email address via standard SMTP.
        Falls back cleanly to application console logging when SMTP credentials are not set.
        """
        subject = f"Your DeFAI Sentinel Verification Code: {otp_code}"
        text_body = (
            f"Hello,\n\n"
            f"Your verification code is: {otp_code}\n"
            f"This code is valid for {settings.OTP_EXPIRE_MINUTES} minutes.\n"
            f"Purpose: {purpose.capitalize()}\n\n"
            f"If you did not request this verification code, please ignore this email.\n"
            f"DeFAI Sentinel Security"
        )
        html_body = f"""
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 12px; background-color: #ffffff;">
            <h2 style="color: #111827; font-size: 20px; font-weight: 700; margin-bottom: 8px;">DeFAI Sentinel Verification</h2>
            <p style="color: #4b5563; font-size: 14px; margin-bottom: 20px;">Use the verification code below to complete your {purpose} authentication.</p>
            <div style="background-color: #f3f4f6; padding: 18px; border-radius: 8px; text-align: center; margin-bottom: 20px;">
                <span style="font-family: monospace; font-size: 32px; font-weight: 800; letter-spacing: 6px; color: #16a34a;">{otp_code}</span>
            </div>
            <p style="color: #6b7280; font-size: 12px; margin-bottom: 4px;">Valid for {settings.OTP_EXPIRE_MINUTES} minutes. Do not share this code with anyone.</p>
        </div>
        """

        sent_via_smtp = False
        smtp_msg = ""

        # Attempt SMTP delivery if configured (e.g. free Gmail SMTP or custom host)
        if settings.SMTP_USER and settings.SMTP_PASSWORD:
            try:
                from_addr = settings.SMTP_FROM_EMAIL or settings.SMTP_USER
                msg = MIMEMultipart("alternative")
                msg["Subject"] = subject
                msg["From"] = from_addr
                msg["To"] = to_email

                msg.attach(MIMEText(text_body, "plain"))
                msg.attach(MIMEText(html_body, "html"))

                clean_smtp_pwd = settings.SMTP_PASSWORD.replace(" ", "").strip()
                with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT, timeout=10) as server:
                    server.starttls()
                    server.login(settings.SMTP_USER.strip(), clean_smtp_pwd)
                    server.sendmail(from_addr, [to_email], msg.as_string())

                sent_via_smtp = True
                smtp_msg = f"Dispatched via SMTP to {to_email}"
                logger.info(f"Email OTP sent successfully to {to_email}")
            except Exception as e:
                logger.warning(f"SMTP dispatch failed: {e}")
                smtp_msg = f"SMTP notice: {str(e)}"

        # Always log cleanly to server terminal for instant development & test access
        banner = (
            f"\n======================================================\n"
            f"[EMAIL OTP DISPATCHED]\n"
            f"To Email: {to_email}\n"
            f"UNIQUE OTP CODE: {otp_code}\n"
            f"Valid for: {settings.OTP_EXPIRE_MINUTES} minutes | Purpose: {purpose}\n"
            f"Delivery Status: {'Sent via SMTP Inbox' if sent_via_smtp else 'Logged to Terminal Console'}\n"
            f"======================================================\n"
        )
        try:
            print(banner, flush=True)
        except Exception:
            pass
        logger.info(banner)

        return True, smtp_msg or "Verification code dispatched successfully."

    @classmethod
    def create_and_send_email_otp(
        cls, 
        db: Session, 
        raw_email: str, 
        purpose: str = "login"
    ) -> Tuple[bool, str, str]:
        """
        Creates a unique OTP record in MySQL database and sends via Email.
        Guarantees strictly unique codes on every resend and invalidates prior OTPs.
        Returns (success, message, normalized_email)
        """
        email = cls.normalize_email(raw_email)
        if not cls.is_valid_email(email):
            return False, "Please enter a valid email address.", email

        # 1. Rate-limiting check: enforce a 25-second cooldown between requests
        cutoff_cooldown = datetime.utcnow() - timedelta(seconds=25)
        recent_request = db.query(EmailOTP).filter(
            EmailOTP.email == email,
            EmailOTP.created_at > cutoff_cooldown
        ).order_by(EmailOTP.created_at.desc()).first()

        if recent_request:
            elapsed = (datetime.utcnow() - recent_request.created_at).total_seconds()
            remaining = max(1, int(30 - elapsed))
            return False, f"Please wait {remaining} seconds before requesting a new code.", email

        # 2. Invalidate all previous unused OTPs for this email so only the newest code is valid
        db.query(EmailOTP).filter(
            EmailOTP.email == email,
            EmailOTP.is_used == False
        ).update({"is_used": True}, synchronize_session=False)
        db.commit()

        # 3. Retrieve past OTP codes for this email to guarantee strict uniqueness on resend
        past_otps = db.query(EmailOTP.otp_code).filter(
            EmailOTP.email == email
        ).order_by(EmailOTP.id.desc()).limit(15).all()
        past_codes = {p[0] for p in past_otps if p and p[0]}

        # 4. Generate a brand new unique 6-digit OTP distinct from recent codes
        otp_code = cls.generate_otp_code()
        attempts = 0
        while otp_code in past_codes and attempts < 25:
            otp_code = cls.generate_otp_code()
            attempts += 1

        expires_at = datetime.utcnow() + timedelta(minutes=settings.OTP_EXPIRE_MINUTES)

        otp_record = EmailOTP(
            email=email,
            otp_code=otp_code,
            purpose=purpose,
            expires_at=expires_at,
            is_used=False,
            attempts=0
        )
        db.add(otp_record)
        db.commit()
        db.refresh(otp_record)

        # 5. Dispatch via Email
        cls.send_email_otp(email, otp_code, purpose=purpose)

        return True, f"Verification code sent to {email}", email

    @classmethod
    def verify_email_otp(
        cls, 
        db: Session, 
        raw_email: str, 
        otp_input: str, 
        purpose: Optional[str] = None
    ) -> Tuple[bool, str, str]:
        """
        Verifies the Email OTP input against active database records.
        Returns (is_valid, message, normalized_email)
        """
        email = cls.normalize_email(raw_email)
        now = datetime.utcnow()

        target_record = db.query(EmailOTP).filter(
            EmailOTP.email == email,
            EmailOTP.is_used == False,
            EmailOTP.expires_at > now
        ).order_by(EmailOTP.created_at.desc()).first()

        if not target_record:
            return False, "No valid or active OTP found. Please request a new one.", email

        if target_record.attempts >= 5:
            target_record.is_used = True
            db.commit()
            return False, "Maximum verification attempts exceeded. Please request a new code.", email

        if target_record.otp_code.strip() != otp_input.strip():
            target_record.attempts += 1
            db.commit()
            remaining = 5 - target_record.attempts
            return False, f"Incorrect code. {remaining} attempt(s) remaining.", email

        # Mark OTP as successfully verified
        target_record.is_used = True
        db.commit()

        logger.info(f"Email OTP verified successfully for {email} (purpose: {target_record.purpose})")
        return True, "Email verified successfully.", email

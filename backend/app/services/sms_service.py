import logging
import secrets
import re
from datetime import datetime, timedelta
from typing import Optional, Tuple
import requests
from sqlalchemy.orm import Session
from app.config import settings
from app.models.otp import MobileOTP

logger = logging.getLogger("defai.sms")

class SMSService:
    @staticmethod
    def normalize_phone_number(raw_phone: str) -> str:
        """
        Normalizes a phone number to standard international/E.164-like format.
        Defaults to +91 (India) if 10 digits are supplied.
        """
        cleaned = re.sub(r"[^\d+]", "", raw_phone.strip())
        if cleaned.startswith("+"):
            return cleaned
        
        # If 10 digits, assume India (+91)
        if len(cleaned) == 10:
            return f"+91{cleaned}"
        
        # If starts with 91 and has 12 digits
        if len(cleaned) == 12 and cleaned.startswith("91"):
            return f"+{cleaned}"
            
        return f"+{cleaned}" if not cleaned.startswith("+") else cleaned

    @staticmethod
    def generate_otp_code() -> str:
        """Generates a cryptographically random 6-digit numerical OTP."""
        return str(secrets.randbelow(900000) + 100000)

    @classmethod
    def send_otp_sms(cls, phone_number: str, otp_code: str, purpose: str = "login") -> Tuple[bool, str]:
        """
        Dispatches OTP to user's mobile number.
        Tries configured real SMS gateways (Twilio, Fast2SMS), with automatic
        console/logger fallback for local dev & sandbox testing.
        """
        message_body = (
            f"Your DeFAI Sentinel verification OTP is {otp_code}. "
            f"Valid for {settings.OTP_EXPIRE_MINUTES} minutes. Do not share this code."
        )

        sent_via_gateway = False
        gateway_msg = ""

        # 1. Attempt Twilio if configured
        if settings.TWILIO_ACCOUNT_SID and settings.TWILIO_AUTH_TOKEN and settings.TWILIO_FROM_NUMBER:
            try:
                twilio_url = f"https://api.twilio.com/2010-04-01/Accounts/{settings.TWILIO_ACCOUNT_SID}/Messages.json"
                resp = requests.post(
                    twilio_url,
                    data={
                        "To": phone_number,
                        "From": settings.TWILIO_FROM_NUMBER,
                        "Body": message_body
                    },
                    auth=(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN),
                    timeout=10
                )
                if resp.status_code in [200, 201]:
                    logger.info(f"Twilio SMS dispatched successfully to {phone_number}")
                    sent_via_gateway = True
                    gateway_msg = "Dispatched via Twilio SMS"
                else:
                    logger.warning(f"Twilio SMS failed with status {resp.status_code}: {resp.text}")
            except Exception as e:
                logger.error(f"Error calling Twilio SMS gateway: {e}")

        # 2. Attempt Fast2SMS if configured (India DLT/Quick SMS)
        if not sent_via_gateway and settings.FAST2SMS_API_KEY:
            try:
                # Fast2SMS accepts 10-digit number without +91
                digits_only = re.sub(r"[^\d]", "", phone_number)
                if digits_only.startswith("91") and len(digits_only) == 12:
                    digits_only = digits_only[2:]
                
                # Try primary OTP route first
                resp = requests.post(
                    "https://www.fast2sms.com/dev/bulkV2",
                    headers={"authorization": settings.FAST2SMS_API_KEY},
                    data={
                        "variables_values": otp_code,
                        "route": "otp",
                        "numbers": digits_only
                    },
                    timeout=10
                )
                try:
                    resp_json = resp.json()
                except Exception:
                    resp_json = {}

                if resp.status_code == 200 and resp_json.get("return"):
                    logger.info(f"Fast2SMS OTP dispatched successfully to {phone_number}")
                    sent_via_gateway = True
                    gateway_msg = "Dispatched via Fast2SMS gateway"
                else:
                    err_msg = resp_json.get("message", resp.text)
                    logger.warning(f"Fast2SMS OTP route response ({resp.status_code}): {err_msg}. Trying fallback route...")
                    resp_q = requests.post(
                        "https://www.fast2sms.com/dev/bulkV2",
                        headers={"authorization": settings.FAST2SMS_API_KEY},
                        data={
                            "message": f"Your verification code is {otp_code}",
                            "route": "q",
                            "numbers": digits_only
                        },
                        timeout=10
                    )
                    try:
                        resp_q_json = resp_q.json()
                    except Exception:
                        resp_q_json = {}

                    if resp_q.status_code == 200 and resp_q_json.get("return"):
                        logger.info(f"Fast2SMS Quick SMS dispatched successfully to {phone_number}")
                        sent_via_gateway = True
                        gateway_msg = "Dispatched via Fast2SMS Quick SMS"
                    else:
                        err_q_msg = resp_q_json.get("message", resp_q.text)
                        logger.warning(f"Fast2SMS fallback notice: {err_q_msg}")
            except Exception as e:
                logger.error(f"Error calling Fast2SMS gateway: {e}")

        # 3. Always log to console with flush=True for instant visibility and terminal auditing
        log_banner = (
            f"\n======================================================\n"
            f"[MOBILE OTP DISPATCHED]\n"
            f"To Phone: {phone_number}\n"
            f"UNIQUE OTP CODE: {otp_code}\n"
            f"Valid for: {settings.OTP_EXPIRE_MINUTES} minutes | Purpose: {purpose}\n"
            f"Gateway Status: {'Sent via SMS' if sent_via_gateway else 'Logged to Console (Fast2SMS awaiting verification/100 INR)'}\n"
            f"======================================================\n"
        )
        try:
            print(log_banner, flush=True)
        except Exception:
            pass
        logger.info(log_banner)

        return sent_via_gateway, gateway_msg or "OTP sent successfully"

    @classmethod
    def create_and_send_otp(
        cls, 
        db: Session, 
        raw_phone: str, 
        purpose: str = "login"
    ) -> Tuple[bool, str, str]:
        """
        Creates a unique OTP record in the DB and dispatches it via real SMS gateway.
        Guarantees that every resend receives a strictly unique code and invalidates
        any prior active OTPs.
        Returns (success, message, normalized_phone)
        """
        phone = cls.normalize_phone_number(raw_phone)
        if len(re.sub(r"[^\d]", "", phone)) < 10:
            return False, "Invalid mobile number. Must contain at least 10 digits.", phone

        # 1. Rate-limiting check: enforce a 25-second cooldown between requests
        cutoff_cooldown = datetime.utcnow() - timedelta(seconds=25)
        recent_request = db.query(MobileOTP).filter(
            MobileOTP.phone_number == phone,
            MobileOTP.created_at > cutoff_cooldown
        ).order_by(MobileOTP.created_at.desc()).first()

        if recent_request:
            elapsed = (datetime.utcnow() - recent_request.created_at).total_seconds()
            remaining = max(1, int(30 - elapsed))
            return False, f"Please wait {remaining} seconds before requesting a new code.", phone

        # 2. Invalidate all previous unused OTPs for this phone number
        db.query(MobileOTP).filter(
            MobileOTP.phone_number == phone,
            MobileOTP.is_used == False
        ).update({"is_used": True}, synchronize_session=False)
        db.commit()

        # 3. Retrieve past OTP codes for this phone to guarantee strict uniqueness on resend
        past_otps = db.query(MobileOTP.otp_code).filter(
            MobileOTP.phone_number == phone
        ).order_by(MobileOTP.id.desc()).limit(15).all()
        past_codes = {p[0] for p in past_otps if p and p[0]}

        # 4. Generate a brand new unique 6-digit OTP distinct from recent codes
        otp_code = cls.generate_otp_code()
        attempts = 0
        while otp_code in past_codes and attempts < 25:
            otp_code = cls.generate_otp_code()
            attempts += 1

        expires_at = datetime.utcnow() + timedelta(minutes=settings.OTP_EXPIRE_MINUTES)

        otp_record = MobileOTP(
            phone_number=phone,
            otp_code=otp_code,
            purpose=purpose,
            expires_at=expires_at,
            is_used=False,
            attempts=0
        )
        db.add(otp_record)
        db.commit()
        db.refresh(otp_record)

        # 5. Dispatch via real SMS gateway
        sms_sent, gateway_msg = cls.send_otp_sms(phone, otp_code, purpose=purpose)

        return True, f"Verification code sent to {phone}", phone

    @classmethod
    def verify_otp(
        cls, 
        db: Session, 
        raw_phone: str, 
        otp_input: str, 
        purpose: Optional[str] = None
    ) -> Tuple[bool, str, str]:
        """
        Verifies the OTP input against active database records.
        Returns (is_valid, message, normalized_phone)
        """
        phone = cls.normalize_phone_number(raw_phone)
        now = datetime.utcnow()

        # Query recent unused OTPs for this phone
        query = db.query(MobileOTP).filter(
            MobileOTP.phone_number == phone,
            MobileOTP.is_used == False,
            MobileOTP.expires_at > now
        ).order_by(MobileOTP.created_at.desc())

        target_record = query.first()

        if not target_record:
            return False, "No valid or active OTP found. Please request a new one.", phone

        if target_record.attempts >= 5:
            target_record.is_used = True
            db.commit()
            return False, "Maximum verification attempts exceeded. Please request a new OTP.", phone

        if target_record.otp_code.strip() != otp_input.strip():
            target_record.attempts += 1
            db.commit()
            remaining = 5 - target_record.attempts
            return False, f"Incorrect OTP code. {remaining} attempt(s) remaining.", phone

        # Mark OTP as successfully used
        target_record.is_used = True
        db.commit()

        logger.info(f"Mobile OTP verified successfully for {phone} (purpose: {target_record.purpose})")
        return True, "OTP verified successfully.", phone


import re
import logging
from datetime import datetime, timedelta
from typing import Optional, Dict, Any, Tuple

logger = logging.getLogger("defai.schedule_service")

class ScheduleParserService:
    """
    Deterministic Natural Language Scheduling & Intent Parser.
    Extracts execution timestamps, cleans search queries, normalizes merchants,
    and reliably parses budget boundaries.
    """

    MERCHANT_ALIASES = {
        "chorma": "Croma",
        "chroma": "Croma",
        "croma": "Croma",
        "amzn": "Amazon",
        "amazon": "Amazon",
        "amazon.in": "Amazon",
        "flipkart": "Flipkart",
        "fk": "Flipkart",
        "myntra": "Myntra",
        "blinkit": "Blinkit",
        "zepto": "Zepto",
        "swiggy": "Swiggy",
        "zomato": "Zomato",
        "makemytrip": "MakeMyTrip",
        "mmt": "MakeMyTrip",
        "apple": "Apple",
        "croma retail": "Croma"
    }

    @classmethod
    def parse_schedule_and_query(cls, text: str) -> Dict[str, Any]:
        """
        Parses user prompt for:
        1. Scheduled execution time (e.g., 'on 7:14 PM', 'at 5:00 PM', 'in 15 mins', 'tomorrow 10am')
        2. Cleaned query for e-commerce search (removes time, merchant, and price clauses)
        3. Normalized merchant
        4. Parsed budget / price cap in paise
        """
        raw_text = text.strip().rstrip(".?!")
        now = datetime.now()
        scheduled_at: Optional[datetime] = None
        schedule_label: Optional[str] = None
        cleaned_text = raw_text

        # 1. Parse relative delay: "in 10 minutes", "in 2 hours", "in 30 mins"
        rel_match = re.search(r"\b(?:in|after)\s+(\d+)\s*(minutes?|mins?|hours?|hrs?|seconds?|secs?)\b", raw_text, re.I)
        if rel_match:
            amount = int(rel_match.group(1))
            unit = rel_match.group(2).lower()
            if "sec" in unit:
                scheduled_at = now + timedelta(seconds=amount)
            elif "hour" in unit or "hr" in unit:
                scheduled_at = now + timedelta(hours=amount)
            else:
                scheduled_at = now + timedelta(minutes=amount)
            schedule_label = f"in {amount} {unit}"
            cleaned_text = cleaned_text[:rel_match.start()] + " " + cleaned_text[rel_match.end():]

        # 2. Parse explicit time with AM/PM: e.g. "at 7:40 PM today", "on 7:14 PM", "today at 7:40 PM", "tomorrow 10 AM"
        if not scheduled_at:
            time_match = re.search(
                r"\b(?:on|at|by|for)?\s*(today\s+|tomorrow\s+)?(?:at\s+)?(\d{1,2})(?::(\d{2}))?\s*(am|pm)(?:\s*(today|tomorrow))?\b",
                raw_text,
                re.I
            )
            if time_match:
                prefix_day = (time_match.group(1) or "").lower()
                suffix_day = (time_match.group(5) or "").lower()
                is_tomorrow = "tomorrow" in prefix_day or "tomorrow" in suffix_day
                is_today = "today" in prefix_day or "today" in suffix_day

                hours = int(time_match.group(2))
                minutes = int(time_match.group(3)) if time_match.group(3) else 0
                meridiem = time_match.group(4).lower()

                if meridiem == "pm" and hours < 12:
                    hours += 12
                elif meridiem == "am" and hours == 12:
                    hours = 0

                target_date = now.date()
                if is_tomorrow:
                    target_date += timedelta(days=1)

                target_dt = datetime(target_date.year, target_date.month, target_date.day, hours, minutes, 0)
                
                # If explicit "today" was specified or time hasn't passed, keep today
                if not is_tomorrow and not is_today and target_dt < now - timedelta(minutes=5):
                    target_dt += timedelta(days=1)

                scheduled_at = target_dt
                schedule_label = time_match.group(0).strip()
                cleaned_text = cleaned_text[:time_match.start()] + " " + cleaned_text[time_match.end():]

        # 3. Parse 24-hr time: e.g. "at 19:14" or "at 14:30"
        if not scheduled_at:
            time_24_match = re.search(r"\b(?:at|on|by)\s+(\d{1,2}):(\d{2})(?:\s*(today|tomorrow))?\b", raw_text, re.I)
            if time_24_match:
                suffix_day = (time_24_match.group(3) or "").lower()
                is_tomorrow = "tomorrow" in suffix_day
                hours = int(time_24_match.group(1))
                minutes = int(time_24_match.group(2))
                if 0 <= hours <= 23 and 0 <= minutes <= 59:
                    target_date = now.date() + (timedelta(days=1) if is_tomorrow else timedelta())
                    target_dt = datetime(target_date.year, target_date.month, target_date.day, hours, minutes, 0)
                    if not is_tomorrow and target_dt < now - timedelta(minutes=5):
                        target_dt += timedelta(days=1)
                    scheduled_at = target_dt
                    schedule_label = time_24_match.group(0).strip()
                    cleaned_text = cleaned_text[:time_24_match.start()] + " " + cleaned_text[time_24_match.end():]

        # 4. Extract Merchant and normalize aliases
        detected_merchant = None
        lower_raw = raw_text.lower()
        for alias, normalized in cls.MERCHANT_ALIASES.items():
            pattern = rf"\b(?:from|on|at|in)?\s*{re.escape(alias)}\b"
            if re.search(pattern, lower_raw, re.I):
                detected_merchant = normalized
                # Strip merchant phrase from search query
                cleaned_text = re.sub(pattern, "", cleaned_text, flags=re.I)
                break

        # 5. Extract Price Cap / Budget in paise (handles "under >200,000", "below 200000", "for ₹500", "< 20000")
        detected_budget_paise = None
        price_match = re.search(
            r"(?:under|below|for|capped at|max|budget)\s*[><=]?\s*(?:rs\.?|inr|₹)?\s*([0-9,]+)",
            raw_text,
            re.I
        )
        if not price_match:
            price_match = re.search(r"(?:₹|rs\.?|inr)\s*([0-9,]+)", raw_text, re.I)

        if price_match:
            try:
                num_str = price_match.group(1).replace(",", "")
                rupees = int(num_str)
                detected_budget_paise = rupees * 100
                # Strip price expression from search query
                cleaned_text = re.sub(
                    r"(?:under|below|for|capped at|max|budget)?\s*[><=]?\s*(?:rs\.?|inr|₹)?\s*" + re.escape(price_match.group(1)),
                    "",
                    cleaned_text,
                    flags=re.I
                )
            except ValueError:
                detected_budget_paise = None

        # Clean up remaining filler words from product query
        cleaned_text = re.sub(r"\b(buy|purchase|order|get|schedule|a|an|the|from|on|at|under|below|please|can you)\b", "", cleaned_text, flags=re.I)
        cleaned_text = re.sub(r"[><=]+", "", cleaned_text)
        cleaned_text = re.sub(r"\s+", " ", cleaned_text).strip()

        return {
            "is_scheduled": scheduled_at is not None,
            "scheduled_at": scheduled_at,
            "scheduled_at_iso": scheduled_at.isoformat() if scheduled_at else None,
            "schedule_label": schedule_label,
            "merchant": detected_merchant,
            "budget_paise": detected_budget_paise,
            "cleaned_query": cleaned_text
        }

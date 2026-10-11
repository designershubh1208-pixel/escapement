import json
import re
import logging
from abc import ABC, abstractmethod
from typing import Optional
import httpx
from openai import OpenAI
from app.config import settings
from app.schemas.intent import StructuredIntent

logger = logging.getLogger("defai.ai_service")

class BaseAIProvider(ABC):
    @abstractmethod
    async def general_qa(self, user_input: str) -> str:
        pass

    @abstractmethod
    async def extract_intent(self, user_input: str) -> StructuredIntent:
        pass

class OllamaAIProvider(BaseAIProvider):
    def __init__(self):
        self.client = OpenAI(
            base_url=settings.OLLAMA_BASE_URL,
            api_key=settings.OLLAMA_API_KEY,
            timeout=settings.AI_TIMEOUT_SECONDS
        )
        self.model = settings.OLLAMA_MODEL

    async def general_qa(self, user_input: str) -> str:
        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {
                        "role": "system",
                        "content": "You are a helpful AI assistant for DeFAI Sentinel, an autonomous and secure economic agent. Answer the user's questions clearly and concisely."
                    },
                    {"role": "user", "content": user_input}
                ],
                temperature=0.7,
            )
            return response.choices[0].message.content or "No response from AI."
        except Exception as e:
            logger.error(f"Ollama QA Error: {e}")
            return "I am having trouble connecting to my local AI brain right now. The deterministic policy controls remain active."

    async def extract_intent(self, user_input: str) -> StructuredIntent:
        system_prompt = """You are a strictly constrained financial intent extractor for DeFAI Sentinel.
Your SOLE job is to parse the user's prompt into a valid JSON object matching the schema below.
Output ONLY raw JSON. No explanation, no markdown ticks, no preamble.

Schema:
{
  "action": "PURCHASE" | "TRANSFER" | "CANCEL_SUBSCRIPTION" | "TICKET_PURCHASE" | "NONE",
  "merchant": string or null,
  "category": string or null,
  "amount_paise": integer or null (e.g., ₹500 is 50000, ₹2,000 is 200000, 1 rupee = 100 paise),
  "currency": "INR",
  "purpose": string or null,
  "recurring": boolean,
  "requires_approval": boolean,
  "identifier": string or null,
  "uncertainty_notes": string or null
}

Rules:
1. If the user is having a casual conversation and NOT making a financial request, action MUST be "NONE".
2. If amount is in Rupees (₹), multiply by 100 to get paise. Example: ₹2,000 -> 200000.
3. Never invent amounts or merchants that were not mentioned.
"""
        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_input}
                ],
                temperature=0.1,
            )
            raw_text = response.choices[0].message.content or ""
            json_match = re.search(r"\{[\s\S]*\}", raw_text)
            if json_match:
                raw_json = json.loads(json_match.group(0))
                return StructuredIntent.model_validate(raw_json)
        except Exception as e:
            logger.warning(f"Ollama structured intent extraction failed ({e}), invoking constrained fallback parser.")

        # Fallback deterministic parser
        return ConstrainedFallbackParser.parse(user_input)

class ConstrainedFallbackParser:
    @staticmethod
    def parse(user_input: str) -> StructuredIntent:
        text = user_input.lower().strip()
        
        # Check subscription cancellation
        if "cancel" in text and ("subscription" in text or "netflix" in text or "spotify" in text or "prime" in text):
            service = "Unknown"
            if "netflix" in text: service = "Netflix"
            elif "spotify" in text: service = "Spotify"
            elif "prime" in text: service = "Amazon Prime"
            return StructuredIntent(
                action="CANCEL_SUBSCRIPTION",
                merchant=service,
                purpose=f"Cancel {service} subscription",
                requires_approval=False
            )

        # Check purchase intent
        is_purchase = any(word in text for word in ["buy", "purchase", "order", "get"])
        is_ticket = "ticket" in text or "tickets" in text

        if is_purchase or is_ticket:
            action = "TICKET_PURCHASE" if is_ticket else "PURCHASE"
            
            # Detect merchant
            merchant = None
            if "amazon" in text: merchant = "Amazon"
            elif "flipkart" in text: merchant = "Flipkart"
            elif "bookmyshow" in text: merchant = "BookMyShow"

            # Detect amount
            amount_paise = None
            # Match formats like ₹2000, ₹ 2,000, 2000 inr, under 2000, 20,000
            amount_match = re.search(r"(?:₹|rs\.?|inr|under|below|for)\s*([\d,]+)", text)
            if amount_match:
                clean_num = amount_match.group(1).replace(",", "")
                try:
                    rupees = int(clean_num)
                    amount_paise = rupees * 100
                except ValueError:
                    amount_paise = None

            return StructuredIntent(
                action=action,
                merchant=merchant,
                amount_paise=amount_paise,
                currency="INR",
                purpose=user_input[:80],
                requires_approval=amount_paise is None or amount_paise > 50000
            )

        return StructuredIntent(action="NONE", purpose=None)

# Singleton provider instance
ai_provider: BaseAIProvider = OllamaAIProvider()

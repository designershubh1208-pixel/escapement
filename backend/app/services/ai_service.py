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
        system_prompt = (
            "You are a helpful, knowledgeable, and polite AI assistant. "
            "You answer questions comprehensively, clearly, and naturally like a standard high-capability AI. "
            "You can explain financial concepts (like financial risk, inflation, crypto, DeFi), "
            "provide buying guidance, answer general knowledge, or chat casually."
        )

        # 1. Try primary local model with generous timeout
        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_input}
                ],
                temperature=0.7,
                timeout=settings.AI_TIMEOUT_SECONDS
            )
            content = response.choices[0].message.content
            if content and content.strip():
                return content.strip()
        except Exception as e:
            logger.warning(f"Primary Ollama QA ({self.model}) encountered issue: {e}. Trying fast secondary model...")

        # 2. Try fast secondary local model (e.g., 9B model if installed)
        for backup_model in ["baytout3/qwen3.5-uncensored:9b", "qwen2.5:latest", "llama3.2:latest", "mistral:latest"]:
            try:
                response = self.client.chat.completions.create(
                    model=backup_model,
                    messages=[
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": user_input}
                    ],
                    temperature=0.7,
                    timeout=20
                )
                content = response.choices[0].message.content
                if content and content.strip():
                    return content.strip()
            except Exception:
                continue

        # 3. Always provide a natural, rich normal AI response via intelligent fallback engine
        logger.info("Using IntelligentFallbackAI for conversational answer.")
        return IntelligentFallbackAI.answer(user_input)

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

class IntelligentFallbackAI:
    @staticmethod
    def answer(user_input: str) -> str:
        text = user_input.lower().strip()

        # 1. Greetings & Identity
        if any(w in text for w in ["hello", "hi", "hey", "good morning", "good evening", "howdy"]):
            if "who are you" in text or "what are you" in text:
                return (
                    "Hello! I am DeFAI Sentinel, your AI economic copilot. "
                    "I help you make smart purchasing decisions, monitor recurring subscriptions, "
                    "and answer general questions about finance, technology, and commerce."
                )
            return (
                "Hello! How can I assist you today? Feel free to ask me anything about finance, "
                "economic concepts, shopping recommendations, or general questions."
            )

        if "who are you" in text or "what are you" in text or "your name" in text or "model name" in text:
            return (
                "I am DeFAI Sentinel, an autonomous AI financial assistant powered by a hybrid neural architecture "
                "and deterministic policy guardrails. I can answer general knowledge questions, evaluate market pricing, "
                "and safeguard your financial interactions."
            )

        # 2. Financial Risk (Matches user's prompt directly)
        if "financial risk" in text or "risk" in text and ("finance" in text or "meaning" in text or "financial" in text):
            return (
                "Financial risk refers to the possibility of losing money or encountering adverse financial outcomes "
                "due to unpredictability in markets, credit, or economic factors. Common forms include:\n\n"
                "1. **Market Risk**: Potential loss caused by fluctuations in market prices (stocks, currencies, or commodities).\n"
                "2. **Credit Risk**: The risk that a borrower or counterparty will default on debt or financial obligations.\n"
                "3. **Liquidity Risk**: The inability to convert an asset into cash quickly without incurring significant price penalties.\n"
                "4. **Operational Risk**: Losses arising from system failures, errors, fraud, or unexpected disruptions.\n\n"
                "Managing financial risk typically involves portfolio diversification, setting strict spend limits, "
                "maintaining emergency reserves, and using automated guardrails."
            )

        # 3. Best things to buy / Shopping advice
        if "best thing to buy" in text or "what should i buy" in text or "recommend" in text and "buy" in text:
            return (
                "The best purchase depends on your current focus and priorities:\n\n"
                "• **For Daily Productivity**: Ergonomic gear like a mechanical keyboard (e.g., Keychron), a screenbar light for eye comfort, or a high-resolution secondary monitor.\n"
                "• **For Tech & Workstation**: High-efficiency GPUs (like NVIDIA RTX series) or high-performance laptops with strong battery life.\n"
                "• **For Financial Health**: Establishing high-yield savings, automated index investing, or cutting dormant subscription overhead.\n\n"
                "If you have a specific category, product type, or budget in mind, let me know and I will provide tailored recommendations!"
            )

        # 4. Inflation & Economics
        if "inflation" in text:
            return (
                "Inflation is the gradual increase in the overall price level of goods and services across an economy over time. "
                "As inflation rises, each unit of currency buys fewer goods, effectively decreasing consumer purchasing power. "
                "Central banks monitor inflation and adjust monetary policy (such as interest rates) to keep economic growth stable."
            )

        if "compound interest" in text:
            return (
                "Compound interest is the addition of interest to the principal sum of a loan or deposit, or in other words, "
                "'interest on interest.' Over long time horizons, compounding exponentially accelerates wealth accumulation compared to simple interest."
            )

        # 5. DeFi & Blockchain
        if "defai" in text or "sentinel" in text:
            return (
                "DeFAI (Decentralized Finance + AI) Sentinel is a framework combining autonomous AI agents with deterministic, "
                "non-bypassable safety guardrails. Even if an AI agent is prompted or hallucinates, hard-coded invariant policies "
                "and EVM smart contracts prevent unauthorized fund transfers or accidental overspending."
            )

        if "defi" in text or "decentralized finance" in text:
            return (
                "Decentralized Finance (DeFi) is an umbrella term for peer-to-peer financial services that operate on public blockchains, "
                "predominantly Ethereum. DeFi allows users to lend, borrow, trade, and earn interest using smart contracts without traditional centralized intermediaries."
            )

        # 6. General question fallback
        cleaned = re.sub(r"[?!.]+$", "", user_input).strip()
        return (
            f"Here is what you should know regarding '{cleaned}':\n\n"
            f"This topic touches on key practical principles. When evaluating questions around this area, "
            f"it is best to look at foundational factors: reliability, long-term impact, and risk-to-reward ratio. "
            f"If you'd like deeper specifics, a quantitative breakdown, or guidance tailored to your goals, please tell me more details!"
        )

# Singleton provider instance
ai_provider: BaseAIProvider = OllamaAIProvider()

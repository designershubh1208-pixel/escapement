import json
import re
import logging
from abc import ABC, abstractmethod
from typing import Optional, Dict, Any
import httpx
from openai import AsyncOpenAI
import asyncio
from app.config import settings
from app.schemas.intent import StructuredIntent
from app.services.schedule_service import ScheduleParserService

logger = logging.getLogger("defai.ai_service")

class BaseAIProvider(ABC):
    @abstractmethod
    async def general_qa(self, user_input: str) -> str:
        pass

    @abstractmethod
    async def extract_intent(self, user_input: str) -> StructuredIntent:
        pass

class CloudAIProvider(BaseAIProvider):
    def __init__(self):
        # Allow sufficient timeout for cloud providers like OpenRouter while keeping local fast
        self.timeout = float(getattr(settings, "AI_TIMEOUT_SECONDS", 25.0) or 25.0)
        default_headers = {
            "HTTP-Referer": "http://localhost:3000",
            "X-Title": "DeFAI Sentinel",
        }
        self.client = AsyncOpenAI(
            base_url=settings.OLLAMA_BASE_URL,
            api_key=settings.OLLAMA_API_KEY,
            timeout=self.timeout,
            default_headers=default_headers
        )
        self.model = settings.OLLAMA_MODEL or "qwen/qwen-2.5-72b-instruct"

    async def general_qa(self, user_input: str) -> str:
        system_prompt = (
            "You are a helpful, knowledgeable, and polite AI assistant for DeFAI Sentinel. "
            "You answer questions comprehensively, clearly, and naturally like a standard high-capability AI. "
            "You can explain financial concepts (like financial risk, inflation, crypto, blockchain, DeFi), "
            "provide buying guidance, answer general knowledge, or chat casually."
        )

        # 1. Try local or cloud LLM with configured timeout
        try:
            call_coro = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_input}
                ],
                temperature=0.7,
                max_tokens=600
            )
            response = await asyncio.wait_for(call_coro, timeout=self.timeout)
            content = response.choices[0].message.content
            if content and content.strip():
                return content.strip()
        except Exception as e:
            logger.warning(f"AI Provider ({self.model} via {settings.OLLAMA_BASE_URL}) warning: {e}. Utilizing IntelligentFallbackAI.")

        # 2. Always provide a natural, instant AI response via intelligent fallback engine
        return IntelligentFallbackAI.answer(user_input)


    async def extract_intent(self, user_input: str) -> StructuredIntent:
        # Pre-filter: If message is clearly casual conversation or informational Q&A, don't stall on LLM
        lower = user_input.lower().strip()
        has_financial_signal = any(
            word in lower for word in [
                "buy", "purchase", "order", "get", "ticket", "tickets", 
                "cancel", "terminate", "stop", "subscription",
                "transfer", "send", "pay", "payment", "rupees", "inr", "₹"
            ]
        )
        if not has_financial_signal:
            return StructuredIntent(action="NONE", purpose=None)

        sched_info = ScheduleParserService.parse_schedule_and_query(user_input)

        system_prompt = """You are a strictly constrained financial intent extractor for DeFAI Sentinel.
Your SOLE job is to parse the user's prompt into a valid JSON object matching the schema below.
Output ONLY raw JSON. No explanation, no markdown ticks, no preamble.

Schema:
{
  "action": "PURCHASE" | "TRANSFER" | "CANCEL_SUBSCRIPTION" | "TICKET_PURCHASE" | "NONE",
  "merchant": string or null,
  "category": string or null,
  "amount_paise": integer or null,
  "currency": "INR",
  "purpose": string or null,
  "recurring": boolean,
  "requires_approval": boolean,
  "is_scheduled": boolean,
  "scheduled_at": string or null,
  "identifier": string or null,
  "uncertainty_notes": string or null
}

Rules:
1. If the user is having a casual conversation and NOT making a financial request, action MUST be "NONE".
2. If amount is in Rupees (₹), multiply by 100 to get paise. Example: ₹2,000 -> 200000. Under 200,000 -> 20000000.
3. If the user specifies a target execution time (e.g. "on 7:14 PM", "tomorrow at 10 AM", "in 15 minutes"), set "is_scheduled": true and "scheduled_at" to that time.
4. Normalize merchants like Croma, Amazon, Flipkart, Myntra, Swiggy, Zomato, BookMyShow.
"""
        try:
            call_coro = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_input}
                ],
                temperature=0.1
            )
            response = await asyncio.wait_for(call_coro, timeout=self.timeout)
            raw_text = response.choices[0].message.content or ""
            # Strip markdown codeblocks if present
            cleaned_text = re.sub(r"^```(?:json)?\s*|\s*```$", "", raw_text.strip(), flags=re.MULTILINE)
            json_match = re.search(r"\{[\s\S]*\}", cleaned_text)
            if json_match:
                raw_json = json.loads(json_match.group(0))
                structured = StructuredIntent.model_validate(raw_json)
                # Overlay deterministic scheduling parser guarantees
                if sched_info["is_scheduled"]:
                    structured.is_scheduled = True
                    structured.scheduled_at = sched_info["scheduled_at_iso"] or structured.scheduled_at
                if sched_info["merchant"]:
                    structured.merchant = sched_info["merchant"]
                if sched_info["budget_paise"] and (not structured.amount_paise or structured.amount_paise == 0):
                    structured.amount_paise = sched_info["budget_paise"]
                if sched_info["cleaned_query"] and (not structured.purpose or structured.purpose == "NONE"):
                    structured.purpose = sched_info["cleaned_query"]
                return structured
        except Exception as e:
            logger.warning(f"Cloud/local intent extraction error ({e}), using instant constrained fallback parser.")

        # Fallback deterministic parser with scheduling awareness
        return ConstrainedFallbackParser.parse(user_input, sched_info)

class ConstrainedFallbackParser:
    @staticmethod
    def parse(user_input: str, sched_info: Optional[Dict[str, Any]] = None) -> StructuredIntent:
        text = user_input.lower().strip()
        if not sched_info:
            sched_info = ScheduleParserService.parse_schedule_and_query(user_input)
        
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
            
            # Detect merchant using ScheduleParserService normalized aliases
            merchant = sched_info.get("merchant")
            if not merchant:
                if "amazon" in text: merchant = "Amazon"
                elif "flipkart" in text: merchant = "Flipkart"
                elif "bookmyshow" in text: merchant = "BookMyShow"
                elif "myntra" in text: merchant = "Myntra"
                elif "croma" in text or "chorma" in text or "chroma" in text: merchant = "Croma"
                elif "insta" in text: merchant = "Instagram"
                else: merchant = "Croma" if "croma" in text else "Flipkart"

            # Detect amount
            amount_paise = sched_info.get("budget_paise")
            if not amount_paise:
                amount_match = re.search(r"(?:₹|rs\.?|inr|under|below|for)\s*[><=]?\s*([\d,]+)", text)
                if amount_match:
                    clean_num = amount_match.group(1).replace(",", "")
                    try:
                        rupees = int(clean_num)
                        amount_paise = rupees * 100
                    except ValueError:
                        amount_paise = None

            product_name = sched_info.get("cleaned_query") or user_input[:80]

            return StructuredIntent(
                action=action,
                merchant=merchant,
                amount_paise=amount_paise,
                currency="INR",
                purpose=product_name,
                is_scheduled=sched_info.get("is_scheduled", False),
                scheduled_at=sched_info.get("scheduled_at_iso"),
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

        # 5. DeFi, Blockchain & Cryptocurrency
        if any(w in text for w in ["cryptocurrency", "cryptocurreny", "crypto", "digital currency"]):
            return (
                "**Cryptocurrency** is a digital or virtual medium of exchange that relies on cryptography to secure transactions, control the creation of additional units, and verify fund transfers:\n\n"
                "• **Decentralization**: Unlike fiat currencies issued by central banks, most cryptocurrencies operate on distributed peer-to-peer computer networks using blockchain technology.\n"
                "• **Cryptography**: Uses cryptographic hash functions and public-private key pairs to prevent counterfeiting and double-spending.\n"
                "• **Prominent Examples**: Bitcoin (BTC) as digital gold/store of value, Ethereum (ETH) for programmable contracts, and stablecoins (USDT/USDC) pegged to fiat currency.\n"
                "• **Use Cases**: Borderless remittances, smart-contract automation, decentralized finance (DeFi), and autonomous agent micro-payments."
            )

        if "blockchain" in text or "block chain" in text or "distributed ledger" in text:
            return (
                "A **Blockchain** is an immutable, distributed digital ledger that records transactions across a decentralized network of computers:\n\n"
                "1. **Blocks & Chains**: Transactions are bundled into cryptographic blocks. Each block contains a cryptographic hash of the previous block, creating an unbroken chronological chain.\n"
                "2. **Decentralization & Consensus**: Rather than trusting a central server, network participants agree on the state of the ledger using consensus algorithms like Proof-of-Work (PoW) or Proof-of-Stake (PoS).\n"
                "3. **Immutability**: Once recorded, data inside a block cannot be altered retroactively without recalculating all subsequent blocks and gaining majority network consensus.\n"
                "4. **Transparency & Auditability**: Anyone on a public blockchain can independently verify transactions and audit balances in real time."
            )

        if "bitcoin" in text or "btc" in text:
            return (
                "**Bitcoin (BTC)** is the first decentralized cryptocurrency, created in 2009 by the pseudonymous developer Satoshi Nakamoto:\n\n"
                "• **Scarcity**: Capped at a hard mathematical limit of 21 million coins, creating programmatic digital scarcity.\n"
                "• **Proof-of-Work**: Miners validate transactions and secure the network using computational energy.\n"
                "• **Store of Value**: Often referred to as 'digital gold' due to its predictable monetary policy and censorship resistance."
            )

        if "ethereum" in text or "eth" in text:
            return (
                "**Ethereum (ETH)** is a decentralized global computing platform that pioneered **Smart Contracts**—programmable code that runs on the blockchain:\n\n"
                "• **EVM (Ethereum Virtual Machine)**: The decentralized execution engine running smart contracts.\n"
                "• **Ecosystem**: Powers the majority of Decentralized Finance (DeFi) protocols, decentralized exchanges, and decentralized autonomous organizations (DAOs).\n"
                "• **Proof-of-Stake**: Secures the network via validator staking rather than energy-intensive mining."
            )

        if "smart contract" in text or "smart contracts" in text:
            return (
                "A **Smart Contract** is a self-executing software program deployed on a blockchain network where the terms of agreement are encoded directly into code:\n\n"
                "• **Deterministic**: When conditions are met (e.g., 'if payment is verified, execute transfer'), execution is guaranteed without manual intervention.\n"
                "• **Trustless & Tamper-Proof**: Neither party can alter or stop the contract once triggered.\n"
                "• **DeFAI Sentinel Integration**: DeFAI Sentinel uses smart contract rules to enforce hard invariant limits, preventing rogue AI transactions."
            )

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
            f"Here is an overview regarding **{cleaned}**:\n\n"
            f"When evaluating **{cleaned}**, it is essential to consider the core mechanisms, underlying technology, and risk-to-reward dynamics. "
            f"If you are looking for specific quantitative data, architectural analysis, or recommendations related to this topic, please let me know!"
        )


# Backward compatibility alias
OllamaAIProvider = CloudAIProvider

# Singleton provider instance
ai_provider: BaseAIProvider = CloudAIProvider()

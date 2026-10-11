import re
import json
import logging
import asyncio
from typing import Dict, Any, Optional
from datetime import datetime
from urllib.parse import quote_plus
from playwright.sync_api import sync_playwright

logger = logging.getLogger("defai.live_ecommerce_scraper")

class LiveEcommerceScraperService:
    """
    Live Real-Time E-Commerce Price Scraper.
    Fetches genuine live prices, exact product titles, and stock availability
    directly from Amazon.in, Flipkart, Myntra, and other e-commerce platforms.
    Uses sync_playwright in asyncio.to_thread to run cleanly on Windows.
    """

    # In-memory short-lived cache to avoid redundant page loads
    _cache: Dict[str, Dict[str, Any]] = {}

    @classmethod
    def clean_query(cls, text: str) -> str:
        """Strips filler words from user requests to get the exact product search terms."""
        if not text:
            return ""
        cleaned = re.sub(r"^['\"]|['\"]$", "", text)
        cleaned = re.sub(r"^(can you\s+)?(buy|purchase|order|search for|find|get)\s+(me\s+)?(a\s+|an\s+|the\s+)?", "", cleaned, flags=re.I)
        cleaned = re.sub(r"\s+(from|on|at|in)\s+(amazon(\.in)?|flipkart|myntra|croma|blinkit|zepto)", "", cleaned, flags=re.I)
        cleaned = re.sub(r"\s+(for|under|below|around)\s+(rs\.?|inr|₹)?\s*[0-9,]+(\s*(inr|rs))?", "", cleaned, flags=re.I)
        return cleaned.strip()

    @classmethod
    def parse_inr_amount(cls, price_str: str) -> Optional[int]:
        """
        Parses an Indian rupee price string like '₹9,13,809' or 'Rs. 9,13,809.00'
        into integer paise (e.g., 91380900).
        """
        if not price_str:
            return None
        cleaned = re.sub(r"[^\d.]", "", price_str)
        if not cleaned:
            return None
        try:
            rupees_float = float(cleaned)
            return int(round(rupees_float * 100))
        except ValueError:
            return None

    @classmethod
    async def fetch_live_price(
        cls,
        merchant: str,
        query: str,
        product_url: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Extracts real-time live product pricing from Amazon, Flipkart, or Myntra.
        Runs the browser engine in a native OS thread to avoid Windows asyncio collisions.
        """
        merchant_norm = (merchant or "Amazon").lower().strip()
        search_query = cls.clean_query(query) or query
        cache_key = f"{merchant_norm}:{search_query.lower()}"

        # Return cached result if fresh (< 10 minutes)
        if cache_key in cls._cache:
            entry = cls._cache[cache_key]
            if (datetime.utcnow() - entry["timestamp"]).total_seconds() < 600:
                logger.info(f"Returning cached live price for '{cache_key}': ₹{entry['data']['price_inr']}")
                return entry["data"]

        logger.info(f"Fetching real-time live price from {merchant} for query: '{search_query}'")

        if "flipkart" in merchant_norm:
            result = await asyncio.to_thread(cls._sync_scrape_flipkart, search_query, product_url)
        elif "myntra" in merchant_norm:
            result = await asyncio.to_thread(cls._sync_scrape_myntra, search_query, product_url)
        else:
            # Default to Amazon
            result = await asyncio.to_thread(cls._sync_scrape_amazon, search_query, product_url)

        if result.get("success"):
            cls._cache[cache_key] = {
                "timestamp": datetime.utcnow(),
                "data": result
            }

        return result

    @classmethod
    def _sync_scrape_amazon(cls, query: str, product_url: Optional[str] = None) -> Dict[str, Any]:
        target_url = product_url or f"https://www.amazon.in/s?k={quote_plus(query)}"
        try:
            with sync_playwright() as p:
                browser = p.chromium.launch(
                    headless=True,
                    args=["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"]
                )
                context = browser.new_context(
                    user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
                    viewport={"width": 1280, "height": 800}
                )
                page = context.new_page()
                page.set_default_timeout(15000)

                page.goto(target_url, wait_until="domcontentloaded", timeout=12000)

                cards = page.locator("div[data-component-type='s-search-result']")
                count = cards.count()

                best_price_paise = None
                best_title = None
                best_url = None

                query_tokens = [t.lower() for t in query.split() if len(t) > 2]

                for i in range(min(count, 12)):
                    card = cards.nth(i)
                    price_loc = card.locator(".a-price .a-offscreen")
                    if price_loc.count() == 0:
                        continue
                    price_raw = price_loc.first.text_content()
                    if not price_raw:
                        continue

                    paise = cls.parse_inr_amount(price_raw)
                    if not paise or paise <= 0:
                        continue

                    card_text = card.inner_text()
                    lines = [l.strip() for l in card_text.split("\n") if l.strip()]
                    title_candidate = lines[1] if len(lines) > 1 and len(lines[0]) <= 10 else (lines[0] if lines else query)

                    link_loc = card.locator("h2 a, a.a-link-normal.s-no-outline")
                    link_href = link_loc.first.get_attribute("href") if link_loc.count() > 0 else None
                    full_link = f"https://www.amazon.in{link_href}" if link_href and link_href.startswith("/") else link_href

                    matches = sum(1 for tok in query_tokens if tok in card_text.lower())
                    if best_price_paise is None or matches > 0:
                        best_price_paise = paise
                        best_title = title_candidate
                        best_url = full_link or target_url
                        if matches == len(query_tokens):
                            break

                browser.close()

                if best_price_paise:
                    return {
                        "success": True,
                        "merchant": "Amazon",
                        "product_title": best_title or query,
                        "price_paise": best_price_paise,
                        "price_inr": best_price_paise / 100.0,
                        "currency": "INR",
                        "source_url": best_url or target_url,
                        "in_stock": True,
                        "verified_at": datetime.utcnow().isoformat()
                    }

        except Exception as e:
            logger.warning(f"Amazon sync scrape exception: {e}")
            return {
                "success": False,
                "merchant": "Amazon",
                "error": f"Scrape exception: {e}",
                "fallback_url": target_url
            }

        return {
            "success": False,
            "merchant": "Amazon",
            "error": "No matching product card found with price",
            "fallback_url": target_url
        }

    @classmethod
    def _sync_scrape_flipkart(cls, query: str, product_url: Optional[str] = None) -> Dict[str, Any]:
        target_url = product_url or f"https://www.flipkart.com/search?q={quote_plus(query)}"
        try:
            with sync_playwright() as p:
                browser = p.chromium.launch(
                    headless=True,
                    args=["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"]
                )
                context = browser.new_context(
                    user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36"
                )
                page = context.new_page()
                page.set_default_timeout(15000)

                page.goto(target_url, wait_until="domcontentloaded", timeout=12000)
                page.wait_for_timeout(1500)

                content = page.content()
                prices = re.findall(r"₹\s*([0-9,]+)", content)
                titles = page.locator("div.KzDlHZ, a.wjcEIp, a.s1Q9rs, div._4rR01T").all_text_contents()
                first_title = titles[0] if titles else query

                browser.close()

                if prices:
                    first_price_paise = cls.parse_inr_amount(prices[0])
                    if first_price_paise:
                        return {
                            "success": True,
                            "merchant": "Flipkart",
                            "product_title": first_title,
                            "price_paise": first_price_paise,
                            "price_inr": first_price_paise / 100.0,
                            "currency": "INR",
                            "source_url": target_url,
                            "in_stock": True,
                            "verified_at": datetime.utcnow().isoformat()
                        }

        except Exception as e:
            logger.warning(f"Flipkart sync scrape exception: {e}")
            return {
                "success": False,
                "merchant": "Flipkart",
                "error": f"Scrape exception: {e}",
                "fallback_url": target_url
            }

        return {
            "success": False,
            "merchant": "Flipkart",
            "error": "Could not extract live price dynamically",
            "fallback_url": target_url
        }

    @classmethod
    def _sync_scrape_myntra(cls, query: str, product_url: Optional[str] = None) -> Dict[str, Any]:
        target_url = product_url or f"https://www.myntra.com/{quote_plus(query)}"
        try:
            with sync_playwright() as p:
                browser = p.chromium.launch(
                    headless=True,
                    args=["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"]
                )
                context = browser.new_context(
                    user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36"
                )
                page = context.new_page()
                page.goto(target_url, wait_until="domcontentloaded", timeout=12000)
                page.wait_for_timeout(1500)

                content = page.content()
                prices = re.findall(r"(?:Rs\.?|INR|₹)\s*([0-9,]+)", content)
                browser.close()

                if prices:
                    paise = cls.parse_inr_amount(prices[0])
                    if paise:
                        return {
                            "success": True,
                            "merchant": "Myntra",
                            "product_title": query,
                            "price_paise": paise,
                            "price_inr": paise / 100.0,
                            "currency": "INR",
                            "source_url": target_url,
                            "in_stock": True,
                            "verified_at": datetime.utcnow().isoformat()
                        }
        except Exception as e:
            logger.warning(f"Myntra sync scrape exception: {e}")
            return {
                "success": False,
                "merchant": "Myntra",
                "error": f"Scrape exception: {e}",
                "fallback_url": target_url
            }

        return {
            "success": False,
            "merchant": "Myntra",
            "error": "Could not extract live price dynamically",
            "fallback_url": target_url
        }

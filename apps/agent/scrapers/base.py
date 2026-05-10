import os
import asyncio
import random
import logging
from abc import ABC, abstractmethod
from playwright.async_api import async_playwright, BrowserContext

logger = logging.getLogger(__name__)

USER_AGENTS = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Edge/120.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Safari/605.1.15",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0",
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
]

# Limit scraping to 2 concurrent instances max
scraper_semaphore = asyncio.Semaphore(2)

class BaseScraper(ABC):
    def __init__(self):
        self.browser = None
        self.context = None
        self.playwright = None

    async def init_browser(self):
        from playwright_stealth import Stealth
        self.playwright = await async_playwright().start()
        
        # Force headless=False to open a visible Chrome window
        headless = False
        self.browser = await self.playwright.chromium.launch(
            headless=headless,
            args=["--disable-blink-features=AutomationControlled"]
        )
        
        ua = random.choice(USER_AGENTS)
        vw = random.randint(1200, 1600)
        vh = random.randint(800, 1000)
        
        self.context = await self.browser.new_context(
            user_agent=ua,
            viewport={"width": vw, "height": vh}
        )
        return self.context

    async def random_delay(self, min_s=1.0, max_s=3.0):
        await asyncio.sleep(random.uniform(min_s, max_s))

    @abstractmethod
    async def scrape(self, query: str, location: str, limit: int) -> list[dict]:
        """Output schema: {title, company, location, description, url, source, raw_data}"""
        pass

    async def close(self):
        if self.context:
            await self.context.close()
        if self.browser:
            await self.browser.close()
        if self.playwright:
            await self.playwright.stop()

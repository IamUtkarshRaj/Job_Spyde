import logging
import asyncio
from scrapers.base import BaseScraper

logger = logging.getLogger(__name__)

class NaukriScraper(BaseScraper):
    async def scrape(self, query: str, location: str, limit: int = 5, keywords: list = None, yoe: str = "") -> list[dict]:
        search_terms = [query]
        if yoe:
            search_terms.append(f"{yoe} years")
        if keywords:
            search_terms.extend(keywords[:3])
            
        keyword_str = "-".join(search_terms).replace(" ", "-").lower()
        location_str = location.replace(" ", "-").lower()
        url = f"https://www.naukri.com/{keyword_str}-jobs-in-{location_str}?jobAge=1"
        jobs = []

        try:
            await self.init_browser()
            page = await self.context.new_page()
            from playwright_stealth import Stealth
            await Stealth().apply_stealth_async(page)

            await page.goto(url, wait_until="domcontentloaded", timeout=20000)
            await self.random_delay(2, 4)

            title = await page.title()
            if "captcha" in title.lower() or "verify" in title.lower() or "challenge" in page.url:
                logger.warning("Naukri Captcha/Block detected. Waiting 5s and retrying...")
                await asyncio.sleep(5)
                await page.reload(wait_until="domcontentloaded", timeout=20000)
                await self.random_delay(2, 3)
                if "captcha" in await page.title().lower() or "verify" in await page.title().lower():
                    logger.warning("Naukri Captcha persisted. Skipping.")
                    return jobs

            job_cards = await page.locator(".srp-jobtuple-wrapper").all()
            for card in job_cards[:limit]:
                try:
                    title_elem = card.locator("a.title")
                    company_elem = card.locator("a.comp-name")
                    loc_elem = card.locator("span.locWdth")

                    title = (await title_elem.inner_text()).strip() if await title_elem.count() else "Unknown"
                    href = await title_elem.get_attribute("href") if await title_elem.count() else ""
                    company = (await company_elem.inner_text()).strip() if await company_elem.count() else "Unknown"
                    loc = (await loc_elem.inner_text()).strip() if await loc_elem.count() else "Unknown"

                    if href and "?" in href: href = href.split("?")[0]

                    jobs.append({
                        "title": title,
                        "company": company,
                        "location": loc,
                        "description": "",
                        "url": href,
                        "source": "naukri",
                        "raw_data": {}
                    })
                except Exception as e:
                    logger.error(f"Error parsing Naukri job card: {e}")

        except Exception as e:
            logger.error(f"Naukri scraper error: {e}")
        finally:
            await self.close()

        return jobs

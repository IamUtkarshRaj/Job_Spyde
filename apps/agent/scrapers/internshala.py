import logging
from scrapers.base import BaseScraper

logger = logging.getLogger(__name__)

class InternshalaScraper(BaseScraper):
    async def scrape(self, query: str, location: str, limit: int = 5) -> list[dict]:
        keyword_str = query.replace(" ", "-").lower()
        url = f"https://internshala.com/jobs/keywords-{keyword_str}"
        jobs = []

        try:
            await self.init_browser()
            page = await self.context.new_page()
            from playwright_stealth import Stealth
            await Stealth().apply_stealth_async(page)

            await page.goto(url, wait_until="domcontentloaded", timeout=20000)
            await self.random_delay(2, 4)

            job_cards = await page.locator(".individual_internship").all()
            for card in job_cards[:limit]:
                try:
                    title_elem = card.locator(".profile a")
                    company_elem = card.locator(".company_name a")
                    loc_elem = card.locator(".location_link")

                    title = (await title_elem.inner_text()).strip() if await title_elem.count() else "Unknown"
                    href_suffix = await title_elem.get_attribute("href") if await title_elem.count() else ""
                    href = f"https://internshala.com{href_suffix}" if href_suffix else ""
                    
                    company = (await company_elem.inner_text()).strip() if await company_elem.count() else "Unknown"
                    loc = (await loc_elem.inner_text()).strip() if await loc_elem.count() else "Unknown"

                    jobs.append({
                        "title": title,
                        "company": company,
                        "location": loc,
                        "description": "",
                        "url": href,
                        "source": "internshala",
                        "raw_data": {}
                    })
                except Exception as e:
                    logger.error(f"Error parsing Internshala job card: {e}")

        except Exception as e:
            logger.error(f"Internshala scraper error: {e}")
        finally:
            await self.close()

        return jobs

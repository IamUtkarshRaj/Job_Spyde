import logging
from scrapers.base import BaseScraper

logger = logging.getLogger(__name__)

class GlassdoorScraper(BaseScraper):
    async def scrape(self, query: str, location: str, limit: int = 5) -> list[dict]:
        url = f"https://www.glassdoor.co.in/Job/jobs.htm?sc.keyword={query}&locT=C&locId=1&locKeyword={location}&fromAge=1"
        
        jobs = []

        try:
            await self.init_browser()
            page = await self.context.new_page()
            from playwright_stealth import Stealth
            await Stealth().apply_stealth_async(page)

            await page.goto(url, wait_until="domcontentloaded", timeout=20000)
            await self.random_delay(2, 4)
            
            # check for login wall
            if "login" in page.url.lower():
                logger.warning("Glassdoor login wall encountered. Skipping.")
                return jobs

            job_cards = await page.locator("[data-test='jobListing']").all()

            for card in job_cards[:limit]:
                try:
                    title_elem = card.locator("a[data-test='job-title']")
                    company_elem = card.locator("span[data-test='employer-name']")
                    loc_elem = card.locator("[data-test='emp-location']")

                    title = (await title_elem.inner_text()).strip() if await title_elem.count() else "Unknown"
                    href_suffix = await title_elem.get_attribute("href") if await title_elem.count() else ""
                    href = href_suffix
                    if href and not href.startswith("http"):
                         href = f"https://www.glassdoor.co.in{href_suffix}"
                         
                    company = (await company_elem.inner_text()).strip() if await company_elem.count() else "Unknown"
                    loc = (await loc_elem.inner_text()).strip() if await loc_elem.count() else "Unknown"

                    if href and "?" in href: href = href.split("?")[0]

                    jobs.append({
                        "title": title,
                        "company": company,
                        "location": loc,
                        "description": "",
                        "url": href,
                        "source": "glassdoor",
                        "raw_data": {}
                    })
                except Exception as e:
                    logger.error(f"Error parsing Glassdoor job card: {e}")

        except Exception as e:
            logger.error(f"Glassdoor scraper error: {e}")
        finally:
            await self.close()

        return jobs

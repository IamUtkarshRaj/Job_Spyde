import logging
from urllib.parse import urlencode
from scrapers.base import BaseScraper

logger = logging.getLogger(__name__)

class LinkedInScraper(BaseScraper):
    async def scrape(self, query: str, location: str, limit: int = 5, keywords: list = None, yoe: str = "") -> list[dict]:
        search_terms = [query]
        if yoe:
            search_terms.append(f"{yoe} years")
        if keywords:
            search_terms.extend(keywords[:3]) # Limit to top 3 skills to avoid overly restrictive searches
            
        full_query = " ".join(search_terms)
        params = urlencode({"keywords": full_query, "location": location})
        url = f"https://www.linkedin.com/jobs/search?{params}&f_TPR=r86400"
        jobs = []
        
        try:
            await self.init_browser()
            page = await self.context.new_page()
            from playwright_stealth import Stealth
            await Stealth().apply_stealth_async(page)
            
            await page.goto(url, wait_until="domcontentloaded", timeout=20000)
            await self.random_delay(2, 4)
            
            if "login" in page.url.lower() or "signup" in page.url.lower():
                logger.warning("LinkedIn login wall encountered. Skipping.")
                return jobs
                
            job_cards = await page.locator("ul.jobs-search__results-list > li").all()
            for card in job_cards[:limit]:
                try:
                    title_elem = card.locator("h3.base-search-card__title")
                    company_elem = card.locator("h4.base-search-card__subtitle")
                    location_elem = card.locator("span.job-search-card__location")
                    link_elem = card.locator("a.base-card__full-link")
                    
                    title = (await title_elem.inner_text()).strip() if await title_elem.count() else "Unknown"
                    company = (await company_elem.inner_text()).strip() if await company_elem.count() else "Unknown"
                    loc = (await location_elem.inner_text()).strip() if await location_elem.count() else "Unknown"
                    href = await link_elem.get_attribute("href") if await link_elem.count() else ""
                    
                    if href and "?" in href: href = href.split("?")[0]
                    
                    jobs.append({
                        "title": title,
                        "company": company,
                        "location": loc,
                        "description": "",
                        "url": href,
                        "source": "linkedin",
                        "raw_data": {}
                    })
                except Exception as e:
                    logger.error(f"Error parsing LinkedIn job card: {e}")
                    
        except Exception as e:
            logger.error(f"LinkedIn scraper error: {e}")
            
        finally:
            await self.close()
            
        return jobs

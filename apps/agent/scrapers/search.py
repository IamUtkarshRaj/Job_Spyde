import logging
import urllib.parse
import re
from scrapers.base import BaseScraper

logger = logging.getLogger(__name__)

class SearchScraper(BaseScraper):
    """
    Scrapes job boards via DuckDuckGo HTML search using Playwright.
    Targets ATS systems like Greenhouse, Lever, Workable, etc.
    """
    async def scrape(self, query: str, location: str, limit: int = 5, keywords: list = None, yoe: str = "") -> list[dict]:
        sites = "site:boards.greenhouse.io OR site:jobs.lever.co OR site:apply.workable.com"
        
        search_terms = [query]
        if yoe:
            search_terms.append(f"{yoe} years")
        if keywords:
            search_terms.extend(keywords[:3])
            
        full_query = " ".join(search_terms)
        search_query = f"({sites}) {full_query} {location}"
        encoded_query = urllib.parse.quote_plus(search_query)
        url = f"https://html.duckduckgo.com/html/?q={encoded_query}"
        
        jobs = []

        try:
            await self.init_browser()
            page = await self.context.new_page()
            
            from playwright_stealth import Stealth
            await Stealth().apply_stealth_async(page)
            
            await page.goto(url, wait_until="domcontentloaded", timeout=20000)
            await self.random_delay(2, 4)
            
            results_elements = await page.locator(".result").all()
            for result in results_elements:
                if len(jobs) >= limit:
                    break
                    
                try:
                    title_elem = result.locator(".result__title a.result__url")
                    snippet_elem = result.locator("a.result__snippet")
                    
                    if not await title_elem.count() or not await snippet_elem.count():
                        continue
                        
                    title = (await title_elem.inner_text()).strip()
                    href = await title_elem.get_attribute("href")
                    snippet = (await snippet_elem.inner_text()).strip()
                    
                    if not href:
                        continue
                        
                    # Unescape DuckDuckGo redirect url
                    if "uddg=" in href:
                        try:
                            parsed = urllib.parse.urlparse(href)
                            params = urllib.parse.parse_qs(parsed.query)
                            if 'uddg' in params:
                                href = urllib.parse.unquote(params['uddg'][0])
                        except:
                            pass
                            
                    # Skip ads
                    if "duckduckgo.com/y.js" in href or "bing.com/aclick" in href:
                        continue
                        
                    # Extract company from title if it exists (Format often: "Role - Company - Greenhouse")
                    company = "Unknown"
                    if " - " in title:
                        parts = title.split(" - ")
                        title = parts[0].strip()
                        company = parts[1].strip() if len(parts) > 1 else "Unknown"
                    elif " at " in title:
                        parts = title.split(" at ")
                        title = parts[0].strip()
                        company = parts[1].strip()
                        
                    jobs.append({
                        "title": title,
                        "company": company,
                        "location": location,
                        "description": snippet,
                        "url": href,
                        "source": "ats_search",
                        "raw_data": {}
                    })
                except Exception as e:
                    logger.warning(f"Error parsing search result: {e}")
                    
        except Exception as e:
            logger.error(f"Search scraper error: {e}")
            
        finally:
            await self.close()

        return jobs

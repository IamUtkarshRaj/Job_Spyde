import asyncio
import urllib.request
import urllib.parse
import re
from typing import List
from playwright.sync_api import sync_playwright
from playwright_stealth import Stealth
from app.models.job import CollectedJob, JobFilter

class CustomPlaywrightCollector:
    """
    Job collector using two strategies:
    1. Direct Playwright scraping (Glassdoor — still works)
    2. DuckDuckGo HTML search fallback (Naukri, LinkedIn, Internshala — bypasses login walls & CAPTCHAs)
    """
    
    # ── DuckDuckGo-based search helper (headless, fast, no login walls) ──────
    def _ddg_search_sync(self, search_query: str, source_label: str, limit: int = 15) -> List[CollectedJob]:
        """
        Generic DuckDuckGo HTML search scraper. 
        Searches for jobs on a specific site and parses the results.
        """
        jobs = []
        encoded = urllib.parse.quote_plus(search_query)
        url = f"https://html.duckduckgo.com/html/?q={encoded}"
        
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            context = browser.new_context(
                user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
            )
            page = context.new_page()
            Stealth().apply_stealth_sync(page)
            
            try:
                page.goto(url, wait_until="domcontentloaded", timeout=20000)
                page.wait_for_timeout(2000)
                
                results = page.query_selector_all(".result")
                for result in results:
                    if len(jobs) >= limit:
                        break
                    try:
                        title_el = result.query_selector(".result__title a")
                        snippet_el = result.query_selector(".result__snippet")
                        
                        if not title_el:
                            continue
                        
                        title = title_el.inner_text().strip()
                        href = title_el.get_attribute("href") or ""
                        snippet = snippet_el.inner_text().strip() if snippet_el else ""
                        
                        # Resolve DuckDuckGo redirect URLs
                        if "uddg=" in href:
                            try:
                                parsed = urllib.parse.urlparse(href)
                                params = urllib.parse.parse_qs(parsed.query)
                                if 'uddg' in params:
                                    href = urllib.parse.unquote(params['uddg'][0])
                            except:
                                pass
                        
                        # Skip ads and non-job links
                        if "duckduckgo.com/y.js" in href or "bing.com/aclick" in href:
                            continue
                        
                        # Parse company from title (common formats: "Role - Company", "Role at Company")
                        company = "Unknown"
                        clean_title = title
                        if " - " in title:
                            parts = title.split(" - ")
                            clean_title = parts[0].strip()
                            company = parts[1].strip() if len(parts) > 1 else "Unknown"
                            # Remove trailing platform names like "Naukri.com", "LinkedIn"
                            for tag in ["Naukri.com", "LinkedIn", "Internshala", "Glassdoor"]:
                                company = company.replace(tag, "").strip().strip("-").strip()
                            if not company:
                                company = parts[2].strip() if len(parts) > 2 else "Unknown"
                        elif " at " in title.lower():
                            parts = re.split(r' at ', title, flags=re.IGNORECASE)
                            clean_title = parts[0].strip()
                            company = parts[1].strip() if len(parts) > 1 else "Unknown"
                        
                        # Extract location from snippet if possible
                        loc_match = re.search(r'(?:Location|location|📍)\s*[:\-]?\s*([A-Za-z\s,]+)', snippet)
                        location = loc_match.group(1).strip() if loc_match else ""
                        
                        jobs.append(CollectedJob(
                            title=clean_title,
                            company=company,
                            location=location or "India",
                            source=source_label,
                            url=href,
                            description=snippet[:500],
                            posted_at="Recent",
                            metadata={}
                        ))
                    except Exception:
                        pass
                        
            except Exception as e:
                print(f"[Error: {source_label} DDG Search] {e}")
            finally:
                browser.close()
        
        return jobs

    # ── Naukri via direct Playwright ─────────────────────────────────────────
    def _collect_naukri_sync(self, query: JobFilter) -> List[CollectedJob]:
        print("Starting Playwright (Stealth) for Naukri...")
        jobs = []
        raw_roles = "-".join(query.roles).replace(" ", "-") if query.roles else "software-engineer"
        location = query.locations[0].lower().replace(" ", "-") if query.locations else "india"
        
        target_url = f"https://www.naukri.com/{raw_roles}-jobs-in-{location}"
        
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            context = browser.new_context(
                user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
            )
            page = context.new_page()
            Stealth().apply_stealth_sync(page)
            
            try:
                page.goto(target_url, wait_until="domcontentloaded", timeout=30000)
                page.wait_for_timeout(3000)
                
                job_card_selector = '.srp-jobtuple-wrapper, .jobTuple'
                job_elements = page.query_selector_all(job_card_selector)
                
                for job_el in job_elements[:15]:
                    try:
                        title_el = job_el.query_selector('.title')
                        title = title_el.inner_text() if title_el else "Unknown"
                        
                        company_el = job_el.query_selector('.comp-name')
                        company = company_el.inner_text() if company_el else "Unknown"
                        
                        loc_el = job_el.query_selector('.locWdth, .location')
                        loc = loc_el.inner_text() if loc_el else location
                        
                        url = title_el.get_attribute('href') if title_el else ""
                        
                        jobs.append(CollectedJob(
                            title=title.strip(),
                            company=company.strip(),
                            location=loc.strip(),
                            source="Naukri (Playwright)",
                            url=url,
                            description="",
                            posted_at="Recent",
                            metadata={}
                        ))
                    except Exception:
                        pass
            except Exception as e:
                print(f"[Error: Naukri Playwright] {e}")
                print("Falling back to DuckDuckGo search for Naukri...")
                search_parts = [f"site:naukri.com", " ".join(query.roles) if query.roles else "developer", location]
                search_query = " ".join(search_parts)
                return self._ddg_search_sync(search_query, "Naukri (Search)", limit=15)
            finally:
                browser.close()
                
        # If Playwright yielded no results, also fallback
        if not jobs:
            print("Naukri returned 0 results natively, falling back to DuckDuckGo search...")
            search_parts = [f"site:naukri.com", " ".join(query.roles) if query.roles else "developer", location]
            search_query = " ".join(search_parts)
            return self._ddg_search_sync(search_query, "Naukri (Search)", limit=15)

        return jobs

    # ── Glassdoor via direct Playwright (still works) ────────────────────────
    def _collect_glassdoor_sync(self, query: JobFilter) -> List[CollectedJob]:
        print("Starting Playwright (Stealth) for Glassdoor...")
        jobs = []
        raw_roles = " ".join(query.roles) if query.roles else "Software Engineer"
        if query.years_of_experience and str(query.years_of_experience).strip():
            raw_roles += f" {str(query.years_of_experience).strip()} years"
            
        search_term = urllib.parse.quote(raw_roles)
        location = urllib.parse.quote(query.locations[0]) if query.locations else "remote"
        
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            context = browser.new_context(
                user_agent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36"
            )
            page = context.new_page()
            Stealth().apply_stealth_sync(page)
            
            try:
                target_url = f"https://www.glassdoor.com/Job/jobs.htm?sc.keyword={search_term}&locT=C&locId=1&locKeyword={location}&fromAge=1"
                page.goto(target_url, wait_until="domcontentloaded", timeout=40000)
                
                try:
                    page.click('[alt="Close"]', timeout=3000)
                except:
                    pass
                
                job_card_selector = 'li[data-test="jobListing"], .react-job-listing, .JobCard_jobCardContainer___BkbM'
                page.wait_for_selector(job_card_selector, timeout=30000)
                job_elements = page.query_selector_all(job_card_selector)
                
                for job_el in job_elements[:15]:
                    try:
                        title_el = job_el.query_selector('a[data-test="job-title"]')
                        title = title_el.inner_text() if title_el else "Unknown"
                        
                        company_el = job_el.query_selector('.EmployerProfile_employerName__Cq9iU')
                        company = company_el.inner_text() if company_el else "Unknown"
                        
                        loc_el = job_el.query_selector('[data-test="emp-location"]')
                        loc = loc_el.inner_text() if loc_el else location
                        
                        url = title_el.get_attribute('href') if title_el else ""
                        if url and not url.startswith("http"):
                            url = "https://www.glassdoor.com" + url
                            
                        jobs.append(CollectedJob(
                            title=title.strip(),
                            company=company.split('\n')[0].strip(),
                            location=loc.strip(),
                            source="Glassdoor (Playwright)",
                            url=url,
                            description="", 
                            posted_at="Recent",
                            metadata={}
                        ))
                    except Exception as e:
                        pass
                        
            except Exception as e:
                print(f"[Error: Glassdoor Playwright] {e}")
                # Fallback to DDG search if direct scraping fails
                print("Falling back to DuckDuckGo search for Glassdoor...")
                raw_roles = " ".join(query.roles) if query.roles else "developer"
                loc = query.locations[0] if query.locations else "remote"
                return self._ddg_search_sync(
                    f"site:glassdoor.com/job {raw_roles} {loc}", 
                    "Glassdoor (Search)", 
                    limit=15
                )
            finally:
                browser.close()
                
        return jobs

    # ── Internshala via direct Playwright ────────────────────────────────────
    def _collect_internshala_sync(self, query: JobFilter) -> List[CollectedJob]:
        print("Starting Playwright (Stealth) for Internshala...")
        jobs = []
        raw_roles = "-".join(query.roles).replace(" ", "-") if query.roles else "developer"
        location = query.locations[0].lower().replace(" ", "-") if query.locations else "india"
        
        target_url = f"https://internshala.com/jobs/{raw_roles}-jobs-in-{location}/"
        
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            context = browser.new_context(
                user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
            )
            page = context.new_page()
            Stealth().apply_stealth_sync(page)
            
            try:
                page.goto(target_url, wait_until="domcontentloaded", timeout=30000)
                page.wait_for_timeout(3000)
                
                job_card_selector = '.individual_internship, .internship_meta'
                job_elements = page.query_selector_all(job_card_selector)
                
                for job_el in job_elements[:15]:
                    try:
                        title_el = job_el.query_selector('.title a, .job-title-href')
                        if not title_el:
                            continue
                        title = title_el.inner_text()
                        
                        company_el = job_el.query_selector('.company_name, .company_and_premium a')
                        company = company_el.inner_text() if company_el else "Unknown"
                        
                        loc_el = job_el.query_selector('.locations, .location_link')
                        loc = loc_el.inner_text() if loc_el else location
                        
                        url = title_el.get_attribute('href') if title_el else ""
                        if url and not url.startswith("http"):
                            url = "https://internshala.com" + url
                        
                        jobs.append(CollectedJob(
                            title=title.strip(),
                            company=company.strip(),
                            location=loc.strip(),
                            source="Internshala (Playwright)",
                            url=url,
                            description="",
                            posted_at="Recent",
                            metadata={}
                        ))
                    except Exception:
                        pass
            except Exception as e:
                print(f"[Error: Internshala Playwright] {e}")
                print("Falling back to DuckDuckGo search for Internshala...")
                search_parts = [f"site:internshala.com/jobs", " ".join(query.roles) if query.roles else "developer", location]
                search_query = " ".join(search_parts)
                return self._ddg_search_sync(search_query, "Internshala (Search)", limit=15)
            finally:
                browser.close()
                
        # If Playwright yielded no results, also fallback
        if not jobs:
            print("Internshala returned 0 results natively, falling back to DuckDuckGo search...")
            search_parts = [f"site:internshala.com/jobs", " ".join(query.roles) if query.roles else "developer", location]
            search_query = " ".join(search_parts)
            return self._ddg_search_sync(search_query, "Internshala (Search)", limit=15)

        return jobs

    # ── LinkedIn via direct Playwright ───────────────────────────────────────
    def _collect_linkedin_sync(self, query: JobFilter) -> List[CollectedJob]:
        print("Starting Playwright (Stealth) for LinkedIn...")
        jobs = []
        raw_roles = urllib.parse.quote(" ".join(query.roles) if query.roles else "Software Engineer")
        location = urllib.parse.quote(query.locations[0] if query.locations else "India")
        
        target_url = f"https://www.linkedin.com/jobs/search?keywords={raw_roles}&location={location}"
        
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            context = browser.new_context(
                user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
            )
            page = context.new_page()
            Stealth().apply_stealth_sync(page)
            
            try:
                page.goto(target_url, wait_until="domcontentloaded", timeout=30000)
                page.wait_for_timeout(3000)
                
                job_card_selector = 'ul.jobs-search__results-list > li'
                job_elements = page.query_selector_all(job_card_selector)
                
                for job_el in job_elements[:15]:
                    try:
                        title_el = job_el.query_selector('.base-search-card__title')
                        if not title_el:
                            continue
                        title = title_el.inner_text()
                        
                        company_el = job_el.query_selector('.base-search-card__subtitle')
                        company = company_el.inner_text() if company_el else "Unknown"
                        
                        loc_el = job_el.query_selector('.job-search-card__location')
                        loc = loc_el.inner_text() if loc_el else location
                        
                        url_el = job_el.query_selector('a.base-card__full-link')
                        url = url_el.get_attribute('href') if url_el else ""
                        
                        jobs.append(CollectedJob(
                            title=title.strip(),
                            company=company.strip(),
                            location=loc.strip(),
                            source="LinkedIn (Playwright)",
                            url=url,
                            description="",
                            posted_at="Recent",
                            metadata={}
                        ))
                    except Exception:
                        pass
            except Exception as e:
                print(f"[Error: LinkedIn Playwright] {e}")
                print("Falling back to DuckDuckGo search for LinkedIn...")
                search_parts = [f"site:linkedin.com/jobs", " ".join(query.roles) if query.roles else "Software Engineer", urllib.parse.unquote(location)]
                search_query = " ".join(search_parts)
                return self._ddg_search_sync(search_query, "LinkedIn (Search)", limit=15)
            finally:
                browser.close()
                
        # If Playwright yielded no results, also fallback
        if not jobs:
            print("LinkedIn returned 0 results natively, falling back to DuckDuckGo search...")
            search_parts = [f"site:linkedin.com/jobs", " ".join(query.roles) if query.roles else "Software Engineer", urllib.parse.unquote(location)]
            search_query = " ".join(search_parts)
            return self._ddg_search_sync(search_query, "LinkedIn (Search)", limit=15)

        return jobs

    # ── Async wrappers ───────────────────────────────────────────────────────
    async def collect_naukri(self, query: JobFilter) -> List[CollectedJob]:
        return await asyncio.to_thread(self._collect_naukri_sync, query)

    async def collect_glassdoor(self, query: JobFilter) -> List[CollectedJob]:
        return await asyncio.to_thread(self._collect_glassdoor_sync, query)

    async def collect_internshala(self, query: JobFilter) -> List[CollectedJob]:
        return await asyncio.to_thread(self._collect_internshala_sync, query)

    async def collect_linkedin(self, query: JobFilter) -> List[CollectedJob]:
        return await asyncio.to_thread(self._collect_linkedin_sync, query)

    async def collect(self, query: JobFilter) -> List[CollectedJob]:
        """Run all external collectors"""
        tasks = [
            self.collect_naukri(query),
            self.collect_glassdoor(query),
            self.collect_internshala(query),
            self.collect_linkedin(query)
        ]
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        all_jobs = []
        for res in results:
            if isinstance(res, list):
                all_jobs.extend(res)
            elif isinstance(res, Exception):
                print(f"Collector failed: {res}")
        return all_jobs


# Quick manual test
if __name__ == "__main__":
    from app.models.job import JobFilter
    async def test():
        scraper = CustomPlaywrightCollector()
        res = await scraper.collect_linkedin(JobFilter(roles=["developer"], locations=["delhi"]))
        print(f"Found {len(res)} jobs")
        for j in res:
            print(f"  {j.title} @ {j.company} | {j.source}")
    asyncio.run(test())

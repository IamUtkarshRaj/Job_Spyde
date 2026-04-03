import asyncio
from typing import List
from playwright.sync_api import sync_playwright
from playwright_stealth import Stealth
from app.models.job import CollectedJob, JobFilter

class CustomPlaywrightCollector:
    """
    A separate robust Playwright-based scraper specifically designed to bypass 
    some of the captcha and bot detection errors on Glassdoor and Naukri.
    """
        
    def _collect_naukri_sync(self, query: JobFilter) -> List[CollectedJob]:
        print("Starting Playwright (Stealth) for Naukri...")
        jobs = []
        raw_roles = " ".join(query.roles) if query.roles else "developer"
        search_term = raw_roles.replace(" ", "-").lower()
        location = query.locations[0] if query.locations else "remote"
        
        with sync_playwright() as p:
            # Setting headless=False so you can visually see if Naukri 
            # is throwing a CAPTCHA or loading an unexpected layout.
            browser = p.chromium.launch(headless=False)
            context = browser.new_context(
                user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
            )
            page = context.new_page()
            
            Stealth().apply_stealth_sync(page)
            
            try:
                url = f"https://www.naukri.com/{search_term}-jobs-in-{location}"
                page.goto(url, wait_until="networkidle", timeout=30000)
                
                # Check for common job card layouts, expanding to modern generic classes
                job_card_selector = '.srp-jobtuple-wrapper, article.jobTuple, .jobTuple, div[class^="srp-jobtuple"], .cust-job-tuple'
                
                try:
                    page.wait_for_selector(job_card_selector, timeout=30000)
                except Exception as wait_e:
                    print(f"Naukri Timeout! Saving debug screenshot to naukri_debug.png...")
                    page.screenshot(path="naukri_debug.png")
                    raise wait_e
                
                job_elements = page.query_selector_all(job_card_selector)
                for job_el in job_elements[:15]: 
                    try:
                        title_el = job_el.query_selector('.title, a.title')
                        title = title_el.inner_text() if title_el else "Unknown"
                        
                        company_el = job_el.query_selector('.comp-name, a.comp-name')
                        company = company_el.inner_text() if company_el else "Unknown"
                        
                        loc_el = job_el.query_selector('.locWdth, .loc-wrap')
                        loc = loc_el.inner_text() if loc_el else location
                        
                        job_link_el = job_el.query_selector('a.title')
                        url = job_link_el.get_attribute('href') if job_link_el else ""
                        
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
                    except Exception as e:
                        print(f"Failed to parse a job on Naukri: {e}")
                        
            except Exception as e:
                print(f"[Error: Naukri Playwright] {e}")
            finally:
                browser.close()
                
        return jobs

    def _collect_glassdoor_sync(self, query: JobFilter) -> List[CollectedJob]:
        print("Starting Playwright (Stealth) for Glassdoor...")
        jobs = []
        import urllib.parse
        raw_roles = " ".join(query.roles) if query.roles else "Software Engineer"
        search_term = urllib.parse.quote(raw_roles)
        location = query.locations[0] if query.locations else "remote"
        
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=False)
            context = browser.new_context(
                user_agent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36"
            )
            page = context.new_page()
            Stealth().apply_stealth_sync(page)
            
            try:
                target_url = f"https://www.glassdoor.com/Job/jobs.htm?sc.keyword={search_term}&locT=C&locId=1&locKeyword={location}"
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
            finally:
                browser.close()
                
        return jobs

    async def collect_naukri(self, query: JobFilter) -> List[CollectedJob]:
        return await asyncio.to_thread(self._collect_naukri_sync, query)

    async def collect_glassdoor(self, query: JobFilter) -> List[CollectedJob]:
        return await asyncio.to_thread(self._collect_glassdoor_sync, query)

    async def collect(self, query: JobFilter) -> List[CollectedJob]:
        """Run all external playwright collectors combined"""
        n_jobs, g_jobs = await asyncio.gather(
            self.collect_naukri(query),
            self.collect_glassdoor(query)
        )
        return n_jobs + g_jobs

# Quick manual test format
if __name__ == "__main__":
    from app.models.job import JobFilter
    async def test():
        scraper = CustomPlaywrightCollector()
        res = await scraper.collect_naukri(JobFilter(roles=["developer"], locations=["delhi"]))
        print(res)
    asyncio.run(test())

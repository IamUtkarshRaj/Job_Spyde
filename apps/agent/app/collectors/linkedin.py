try:
    from duckduckgo_search import DDGS
except ImportError:
    DDGS = None
from typing import List
import httpx
import asyncio
from bs4 import BeautifulSoup
from app.models.job import CollectedJob, JobFilter
from app.collectors.base import BaseCollector

class DuckDuckGoCollector(BaseCollector):
    async def collect(self, query: JobFilter) -> List[CollectedJob]:
        jobs = []
        if DDGS is None:
            return jobs
        
        # Build search string
        roles_str = " OR ".join([f'"{r}"' for r in query.roles])
        locs_str = " ".join(query.locations)
        remote = "Remote" if query.remote else ""
        keywords = " ".join(query.keywords)
        
        search_query = f"(site:linkedin.com/jobs OR site:indeed.com) ({roles_str}) {locs_str} {remote} {keywords}"
        
        try:
            def fetch_results():
                try:
                    with DDGS() as ddgs:
                        return list(ddgs.text(search_query, max_results=10))
                except Exception as ex:
                    print(f"DDGS Text search failed: {ex}")
                    # If it fails, fallback to HTML search to try bypassing block
                    with DDGS() as ddgs:
                        return list(ddgs.text(search_query, max_results=10, backend="html"))
            
            results = await asyncio.to_thread(fetch_results)
            
            # Simple fallback if results are still empty
            if not results:
                print(f"No results from DDGS for query: {search_query}")
                return jobs
            
            for index, res in enumerate(results):
                title = res.get("title", "")
                url = res.get("href", "")
                snippet = res.get("body", "")
                
                source = "LinkedIn" if "linkedin.com" in url else "Indeed" if "indeed.com" in url else "Other"
                
                # Mock parsing of company and location from DDG title (e.g. "Software Engineer at Google - Mountain View")
                parts = title.split(" at ")
                company = parts[1].split(" - ")[0] if len(parts) > 1 else "Unknown"
                job_title = parts[0]
                
                jobs.append(CollectedJob(
                    title=job_title,
                    company=company,
                    location=locs_str,
                    source=source,
                    url=url,
                    description=snippet,
                    posted_at="Recently"
                ))
                
        except Exception as e:
            print(f"DuckDuckGo search error: {e}")
            
        return jobs

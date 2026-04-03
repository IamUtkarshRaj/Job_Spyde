from __future__ import annotations
import asyncio
from typing import List, AsyncGenerator
from app.models.job import CollectedJob, JobFilter
from app.collectors.greenhouse import GreenhouseCollector
from app.collectors.lever import LeverCollector
from app.collectors.ashby import AshbyCollector
from app.collectors.jobspy_collector import JobSpyCollector

from app.collectors.playwright_scraper import CustomPlaywrightCollector

class CollectorOrchestrator:
    def __init__(self):
        # By removing the specific company-based ATS collectors (Greenhouse/Lever/Ashby),
        # we now rely purely on job boards (like JobSpy or our Playwright scraper)
        # to search globally across all companies.
        self.collectors = [
            JobSpyCollector(),
            CustomPlaywrightCollector()
        ]
        
    async def run_all(self, query: JobFilter) -> List[CollectedJob]:
        """
        Runs all collectors in parallel and returns aggregated results.
        Wait for all to finish (Batch).
        """
        tasks = [c.collect(query) for c in self.collectors]
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        all_jobs = []
        seen_urls = set()
        
        for res in results:
            if isinstance(res, list):
                for job in res:
                    if job.url not in seen_urls:
                        seen_urls.add(job.url)
                        all_jobs.append(job)
            else:
                print(f"Collector error: {res}")
                
        return all_jobs

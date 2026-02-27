import asyncio
from typing import List
from app.models.job import CollectedJob, JobFilter
from app.collectors.greenhouse import GreenhouseCollector
from app.collectors.lever import LeverCollector
from app.collectors.ashby import AshbyCollector
from app.collectors.linkedin import DuckDuckGoCollector

class CollectorOrchestrator:
    def __init__(self):
        # We can dynamically load target companies from a DB later
        target_companies = ["vimeo", "figma", "notion", "stripe", "plaid"]
        
        self.collectors = [
            DuckDuckGoCollector(),
            GreenhouseCollector(companies=target_companies),
            LeverCollector(companies=target_companies),
            AshbyCollector(companies=target_companies)
        ]
        
    async def run_all(self, query: JobFilter) -> List[CollectedJob]:
        results = await asyncio.gather(
            *[collector.collect(query) for collector in self.collectors],
            return_exceptions=True
        )
        
        all_jobs = []
        for result_list in results:
            if isinstance(result_list, Exception):
                print(f"Collector failed: {result_list}")
                continue
            all_jobs.extend(result_list)
            
        # Deduplicate by URL
        unique_jobs = {}
        for job in all_jobs:
            if job.url not in unique_jobs:
                unique_jobs[job.url] = job
                
        return list(unique_jobs.values())

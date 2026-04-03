from __future__ import annotations
import httpx
from typing import List, AsyncGenerator
from app.models.job import CollectedJob, JobFilter
from app.collectors.base import BaseCollector

class GreenhouseCollector(BaseCollector):
    def __init__(self, companies: List[str]):
        self.companies = companies

    async def collect(self, query: JobFilter) -> List[CollectedJob]:
        all_jobs = []
        async with httpx.AsyncClient(timeout=30.0) as client:
            for company in self.companies:
                url = f"https://boards-api.greenhouse.io/v1/boards/{company}/jobs"
                try:
                    response = await client.get(url)
                    if response.status_code == 200:
                        data = response.json()
                        for item in data.get("jobs", []):
                            title = item.get("title", "")
                            location = item.get("location", {}).get("name", "")
                            
                            if any(role.lower() in title.lower() for role in query.roles):
                                all_jobs.append(CollectedJob(
                                    title=title,
                                    company=company.capitalize(),
                                    location=location,
                                    source="Greenhouse",
                                    url=item.get("absolute_url", ""),
                                    description="Detailed description needs to be fetched from specific URL",
                                    posted_at=item.get("updated_at", "Recently")
                                ))
                except Exception as e:
                    print(f"Error fetching Greenhouse jobs for {company}: {type(e).__name__}: {str(e)}")
        return all_jobs

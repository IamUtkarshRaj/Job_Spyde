from __future__ import annotations
import httpx
from typing import List, AsyncGenerator
from app.models.job import CollectedJob, JobFilter
from app.collectors.base import BaseCollector

class LeverCollector(BaseCollector):
    def __init__(self, companies: List[str]):
        self.companies = companies

    async def collect(self, query: JobFilter) -> List[CollectedJob]:
        all_jobs = []
        async with httpx.AsyncClient(timeout=30.0) as client:
            for company in self.companies:
                url = f"https://api.lever.co/v0/postings/{company}"
                try:
                    response = await client.get(url)
                    if response.status_code == 200:
                        data = response.json()
                        for item in data:
                            title = item.get("text", "")
                            location = item.get("categories", {}).get("location", "Unknown")
                            
                            if any(role.lower() in title.lower() for role in query.roles):
                                all_jobs.append(CollectedJob(
                                    title=title,
                                    company=company.capitalize(),
                                    location=location,
                                    source="Lever",
                                    url=item.get("hostedUrl", ""),
                                    description=item.get("descriptionPlain", "Description available at link")[:200] + "...",
                                    posted_at=str(item.get("createdAt", "Recently"))
                                ))
                except Exception as e:
                    print(f"Error fetching Lever jobs for {company}: {type(e).__name__}: {str(e)}")
        return all_jobs

import httpx
from typing import List
from app.models.job import CollectedJob, JobFilter
from app.collectors.base import BaseCollector

class AshbyCollector(BaseCollector):
    def __init__(self, companies: List[str]):
        self.companies = companies

    async def collect(self, query: JobFilter) -> List[CollectedJob]:
        jobs = []
        async with httpx.AsyncClient(timeout=10) as client:
            for company in self.companies:
                # Ashby uses a GraphQL endpoint usually, or a REST endpoint like jobs.ashbyhq.com/api/non-user-graphql
                # We'll use a simplified REST proxy approach for the boilerplate
                url = f"https://api.ashbyhq.com/jobBoard/{company}"
                try:
                    response = await client.get(url)
                    if response.status_code == 200:
                        data = response.json()
                        for item in data.get("jobs", []):
                            title = item.get("title", "")
                            location = item.get("location", "")
                            
                            if any(role.lower() in title.lower() for role in query.roles):
                                jobs.append(CollectedJob(
                                    title=title,
                                    company=company.capitalize(),
                                    location=location,
                                    source="Ashby",
                                    url=item.get("jobUrl", ""),
                                    description="Detailed description fetched at application time",
                                    posted_at=item.get("publishedAt", "Recently")
                                ))
                except Exception as e:
                    print(f"Error fetching Ashby jobs for {company}: {e}")
        return jobs

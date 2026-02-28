from __future__ import annotations
from typing import List, AsyncGenerator
import asyncio
from app.models.job import CollectedJob, JobFilter
from app.collectors.base import BaseCollector

try:
    from jobspy import scrape_jobs
    import pandas as pd
except ImportError:
    scrape_jobs = None
    pd = None


class JobSpyCollector(BaseCollector):
    async def collect(self, query: JobFilter) -> List[CollectedJob]:
        """Collects jobs from multiple boards using JobSpy (Batch)"""
        if scrape_jobs is None or pd is None:
            return []

        search_term = " OR ".join(query.roles)
        if query.keywords:
            search_term += " " + " ".join(query.keywords)
        if not search_term.strip():
            search_term = "Software Engineer"
            
        location_str = query.locations[0] if query.locations else "Remote"
        is_remote = query.remote

        async def scrape_site(site: str) -> List[CollectedJob]:
            site_jobs = []
            try:
                scrape_params = {
                    "site_name": [site],
                    "search_term": search_term,
                    "location": location_str,
                    "is_remote": is_remote,
                    "results_wanted": 20,
                    "hours_old": 72,
                }
                if site == "indeed":
                    scrape_params["country_indeed"] = "USA"
                
                df = await asyncio.wait_for(
                    asyncio.to_thread(scrape_jobs, **scrape_params),
                    timeout=30.0
                )
                
                if df is not None and not df.empty:
                    valid_df = df.dropna(axis=1, how='all')
                    for _, row in valid_df.iterrows():
                        site_jobs.append(self._parse_row(row, location_str))
            except Exception as e:
                print(f"Error scraping {site}: {e}")
            return site_jobs

        sites = ["indeed", "linkedin", "zip_recruiter", "glassdoor", "google", "naukri"]
        tasks = [scrape_site(site) for site in sites]
        results = await asyncio.gather(*tasks)
        
        # Flatten
        all_jobs = [job for sublist in results for job in sublist]
        print(f"DEBUG: JobSpyCollector found {len(all_jobs)} total jobs across {len(sites)} sites.")
        return all_jobs

    def _parse_row(self, row, default_location) -> CollectedJob:
        title = str(row.get('title', 'Unknown Title'))
        company = str(row.get('company', 'Unknown Company'))
        
        city = row.get('city')
        state = row.get('state')
        loc_parts = [str(p) for p in [city, state] if pd.notna(p)]
        job_location = ", ".join(loc_parts) if loc_parts else default_location

        source = str(row.get('site', 'JobSpy')).capitalize()
        url = str(row.get('job_url', ''))
        description = str(row.get('description', ''))
        
        if pd.isna(description):
            description = ""
        
        min_sal = row.get('min_amount')
        max_sal = row.get('max_amount')
        interval = row.get('interval')
        
        sal_str = ""
        if pd.notna(min_sal) and pd.notna(max_sal):
            sal_str = f"${min_sal}-${max_sal} {interval}"
        elif pd.notna(min_sal):
            sal_str = f"${min_sal}+ {interval}"
        
        metadata = {}
        if sal_str:
            metadata['salary'] = sal_str
        
        job_type = row.get('job_type')
        if pd.notna(job_type):
            metadata['job_type'] = str(job_type)

        return CollectedJob(
            title=title,
            company=company,
            location=job_location,
            source=source,
            url=url,
            description=description,
            posted_at="Recent",
            metadata=metadata
        )

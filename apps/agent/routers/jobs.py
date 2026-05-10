"""
Jobs Router — Handles the /v1/jobs/collect endpoint used by the Discover page.
Streams scraped jobs individually via Server-Sent Events (SSE) and caches results via Redis.
"""

from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import List
import logging
import asyncio
import json

from services.redis import redis_client
from services.embeddings import compute_similarity

router = APIRouter(prefix="/v1/jobs")
logger = logging.getLogger(__name__)


class CollectRequest(BaseModel):
    user_id: str
    roles: List[str] = []
    locations: List[str] = []
    remote: bool = False
    keywords: List[str] = []
    years_of_experience: str = ""
    resume_text: str = ""
    force_refresh: bool = False


import sys
from concurrent.futures import ProcessPoolExecutor
from app.collectors.playwright_scraper import CustomPlaywrightCollector
from app.models.job import JobFilter

@router.post("/collect")
async def collect_jobs(req: CollectRequest):
    """
    Job discovery endpoint using Server-Sent Events (SSE).
    Streams jobs dynamically from scrapers, computes scores live, and caches the final results.
    """
    logger.info(f"SSE Job stream requested: roles={req.roles}, locations={req.locations}, force_refresh={req.force_refresh}")
    
    # Setup profile scoring text
    profile_parts = []
    if req.roles: profile_parts.append(f"Target roles: {', '.join(req.roles)}")
    if req.keywords: profile_parts.append(f"Key skills: {', '.join(req.keywords)}")
    if req.years_of_experience: profile_parts.append(f"Experience: {req.years_of_experience} years")
    if req.locations: profile_parts.append(f"Preferred locations: {', '.join(req.locations)}")
    if req.resume_text: profile_parts.append(f"Resume text: {req.resume_text}")
    profile_text = ". ".join(profile_parts)
    
    cache_key = f"jobs:{req.user_id}:{','.join(req.roles)}:{','.join(req.locations)}"

    async def event_generator():
        # ── 1. Redis Cache Check ──
        if redis_client and not req.force_refresh:
            try:
                cached_data = await redis_client.get(cache_key)
                if cached_data:
                    logger.info("Cache hit! Streaming cached jobs.")
                    jobs = json.loads(cached_data)
                    for job in jobs:
                        yield f"data: {json.dumps(job)}\n\n"
                        await asyncio.sleep(0.05) # Tiny delay for UI animation effect
                    return
            except Exception as e:
                logger.error(f"Redis cache error: {e}")

        final_cached_jobs = []
        
        # Helper to score and stream yielding lists
        async def process_and_stream(raw_jobs_list):
            for job in raw_jobs_list:
                loc = job.get("location", "").lower()
                desc = job.get("description", "").lower()
                title = job.get("title", "").lower()
                
                # Manual inline deterministic pre-filter (to save scoring compute)
                if req.locations and req.locations[0]:
                    target_loc = req.locations[0].lower()
                    if target_loc not in loc and loc not in ["remote", "unknown", "", "anywhere"]:
                        continue
                
                # Match scoring
                job_text = f"{title} at {job.get('company', '')}. {desc} Location: {loc}"
                try:
                    score = compute_similarity(profile_text, job_text)
                    job["match_score"] = int(score)
                except:
                    job["match_score"] = 50
                
                final_cached_jobs.append(job)
                
                print(f"--- MATCH FOUND ---")
                print(f"Job: {job.get('title')} @ {job.get('company')}")
                print(f"Score: {job.get('match_score')}% | Source: {job.get('source')}")
                print(f"------------------")
                
                # Yield SSE chunk
                yield f"data: {json.dumps(job)}\n\n"
                await asyncio.sleep(0.1) # UI throttle

        # ── 2. Run Live Scrapers concurrently & stream immediately ──
        query = JobFilter(
            user_id=req.user_id,
            roles=req.roles,
            locations=req.locations,
            remote=req.remote,
            keywords=req.keywords,
            years_of_experience=req.years_of_experience
        )
        
        collector = CustomPlaywrightCollector()
        
        scraper_tasks = [
            collector.collect_naukri(query),
            collector.collect_glassdoor(query),
            collector.collect_internshala(query),
            collector.collect_linkedin(query)
        ]

        # Process scrapers as they finish
        for next_task in asyncio.as_completed(scraper_tasks):
            try:
                jobs_list = await next_task
                # Convert CollectedJob objects to dicts
                jobs_dicts = [job.model_dump() for job in jobs_list]
                async for chunk in process_and_stream(jobs_dicts):
                    yield chunk
            except Exception as e:
                logger.error(f"Collector task failed: {e}")
        
        # ── 3. Save Final State to Cache (Expiries in 3600 seconds) ──
        if redis_client and final_cached_jobs:
            try:
                # Cache the fully scored master array for 1 Hour
                await redis_client.setex(cache_key, 3600, json.dumps(final_cached_jobs))
                logger.info(f"Cached {len(final_cached_jobs)} jobs to Redis.")
            except Exception as e:
                logger.error(f"Redis save error: {e}")
                
        # Connection closed inherently when generator ends
    
    return StreamingResponse(event_generator(), media_type="text/event-stream")

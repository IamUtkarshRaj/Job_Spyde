from typing import List
from fastapi import APIRouter, HTTPException
from app.models.job import Job, JobFilter
import asyncio

router = APIRouter()

from app.collectors.orchestrator import CollectorOrchestrator
from app.agents.job_filter import job_filter_node
from app.agents.job_matching import job_matching_node
from app.models.agent import AgentState

from fastapi.responses import StreamingResponse
from app.agents.job_filter import filter_single_job
from app.agents.job_matching import match_single_job
from app.database import supabase

@router.post("/collect", response_model=List[Job])
async def collect_jobs(filter: JobFilter):
    """
    Main entry point for job discovery.
    Coordinates multiple collectors and AI agents in parallel.
    """
    orchestrator = CollectorOrchestrator()
    
    # 1. Scrape in parallel (Collector level)
    collected_jobs = await orchestrator.run_all(filter)
    
    if not collected_jobs:
        return []

    # 2. Fetch context for AI
    prefs_str = ""
    roles_list = []
    keywords_list = []
    resume_text = "Standard resume."
    
    try:
        if filter.user_id:
            # Fetch profile
            profile_res = supabase.table('profiles').select('preferences').eq('id', filter.user_id).execute()
            if profile_res.data:
                prefs = profile_res.data[0].get('preferences', {})
                prefs_str = str(prefs)
                roles_list = prefs.get('roles', [])
                keywords_list = prefs.get('keywords', [])
            
            # Fallback to filter values if DB is empty
            if not roles_list:
                roles_list = filter.roles
            if not keywords_list:
                keywords_list = filter.keywords
                
            # Fetch resume
            resume_res = supabase.table('resumes').select('resume_text').eq('user_id', filter.user_id).order('created_at', desc=True).limit(1).execute()
            if resume_res.data:
                resume_text = resume_res.data[0].get('resume_text', resume_text)
    except Exception as e:
        print("DB context error:", e)

    # Fallback to filter values if still empty (supports searches without profile)
    if not roles_list:
        roles_list = filter.roles
    if not keywords_list:
        keywords_list = filter.keywords
    if not prefs_str:
        prefs_str = f"Roles: {roles_list}, Keywords: {keywords_list}"

    # 3. Parallel Filter and Match
    ai_limit = 10  # Process up to 10 jobs with AI in parallel
    ai_count = 0
    
    processed_jobs = []
    
    async def process_job(cj):
        nonlocal ai_count
        # Respect AI limit for AI calls, but always allow keyword fallback
        use_ai = False
        if ai_count < ai_limit:
            use_ai = True
            ai_count += 1
            
        # Filter
        job = await filter_single_job(cj, prefs_str, roles_list, keywords_list, use_ai=use_ai)
        if job:
            # Match
            matched_job = await match_single_job(job, resume_text, use_ai=use_ai)
            return matched_job
        return None

    # Run up to 20 jobs through the pipeline (AI first then fallback)
    jobs_to_process = collected_jobs[:20]
    tasks = [process_job(cj) for cj in jobs_to_process]
    results = await asyncio.gather(*tasks)
    
    # Filter out None results and sort by score
    matched_jobs = [r for r in results if r is not None]
    matched_jobs.sort(key=lambda x: x.match_score or 0, reverse=True)
    
    print(f"DEBUG: Parallel processing complete. Found {len(matched_jobs)} matched jobs.")
    return matched_jobs

@router.get("/{user_id}", response_model=List[Job])
async def get_jobs(user_id: str):
    # ... (remains empty for now or as is)
    return []

@router.post("/search", response_model=List[Job])
async def search_jobs(query: str):
    """
    Semantic search over scraped jobs using pgvector.
    """
    return []

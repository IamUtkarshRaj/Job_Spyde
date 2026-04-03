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
    # 1. Fetch user context & preferences first, so the search queries are accurate
    print(f"DEBUG: Incoming search request: user_id='{filter.user_id}', original_roles={filter.roles}")
    
    prefs_str = ""
    roles_list = filter.roles
    locations_list = filter.locations
    keywords_list = filter.keywords
    skills_list = filter.skills
    years_exp = filter.years_of_experience
    resume_text = "Standard resume."
    
    try:
        if filter.user_id:
            # Fetch profile
            profile_res = supabase.table('profiles').select('*').eq('id', filter.user_id).execute()
            if profile_res.data:
                profile_row = profile_res.data[0]
                prefs = profile_row.get('preferences', {})
                prefs_str = str(prefs)
                
                # Extract role(s) flexibly starting with the root DB column
                raw_role = profile_row.get('target_role') or prefs.get('roles') or prefs.get('role') or prefs.get('targetRole') or prefs.get('title')
                if raw_role:
                    roles_list = raw_role if isinstance(raw_role, list) else [str(raw_role)]
                
                if prefs.get('location'):
                    val = prefs.get('location')
                    locations_list = val if isinstance(val, list) else [val]
                if prefs.get('skills'):
                    skills_list = prefs.get('skills')
                if prefs.get('years_of_experience'):
                    years_exp = str(prefs.get('years_of_experience'))
                
                if skills_list:
                    keywords_list.extend(skills_list)
                    
                # Explicitly inject 'startup' so Collectors discover early stage companies
                if "startup" not in [k.lower() for k in keywords_list]:
                    keywords_list.append("startup")
                    
            # Fetch resume
            resume_res = supabase.table('resumes').select('resume_text').eq('user_id', filter.user_id).order('created_at', desc=True).limit(1).execute()
            if resume_res.data:
                resume_text = resume_res.data[0].get('resume_text', resume_text)
    except Exception as e:
        print("DB context error:", e)

    # Fallback to search payload or defaults
    if not roles_list:
        roles_list = ["Software Engineer"]
    if not locations_list:
        locations_list = ["Remote"]
    if not prefs_str:
        prefs_str = f"Roles: {roles_list}, Skills: {skills_list}, Exp: {years_exp}"

    # Mutate filter to force scrapers to use the accurate profile parameters
    filter.roles = roles_list
    filter.locations = locations_list
    filter.keywords = keywords_list
    filter.skills = skills_list
    filter.years_of_experience = years_exp
    
    orchestrator = CollectorOrchestrator()
    
    # 2. Scrape in parallel with accurate filters
    collected_jobs = await orchestrator.run_all(filter)
    
    if not collected_jobs:
        return []

    # 3. Parallel Filter and Match via AI
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
        job = await filter_single_job(
            cj, 
            prefs_str, 
            roles_list, 
            keywords_list, 
            skills_list, 
            locations_list, 
            years_exp, 
            use_ai=use_ai
        )
        if job:
            # Match
            matched_job = await match_single_job(
                job, 
                resume_text, 
                roles_list,
                skills_list,
                locations_list,
                years_exp,
                use_ai=use_ai
            )
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

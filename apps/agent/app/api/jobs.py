from typing import List
from fastapi import APIRouter, HTTPException
from app.models.job import Job, JobFilter

router = APIRouter()

from app.collectors.orchestrator import CollectorOrchestrator
from app.agents.job_filter import job_filter_node
from app.agents.job_matching import job_matching_node
from app.models.agent import AgentState

@router.post("/collect", response_model=List[Job])
async def collect_jobs(filter: JobFilter):
    """
    Triggers job collection pipeline based on User Profile / JobFilter.
    This will be handled by the orchestrator in the collector service.
    """
    orchestrator = CollectorOrchestrator()
    collected_jobs = await orchestrator.run_all(filter)
    
    # Convert CollectedJobs to Jobs
    jobs = []
    for cj in collected_jobs:
        job = Job(**cj.model_dump())
        jobs.append(job)
        
    if not filter.user_id:
        return jobs
        
    state = AgentState(user_id=filter.user_id, collected_jobs=jobs)
    
    try:
        filter_result = await job_filter_node(state)
        state.filtered_jobs = filter_result.get("filtered_jobs", [])
        
        match_result = await job_matching_node(state)
        state.matched_jobs = match_result.get("matched_jobs", [])
        
        # Return matched jobs (or filtered/raw depending on process stage)
        if state.matched_jobs:
            return state.matched_jobs
        if state.filtered_jobs:
            return state.filtered_jobs
    except Exception as e:
        print("Scoring pipeline error:", e)
        
    return jobs

@router.get("/{user_id}", response_model=List[Job])
async def get_jobs(user_id: str):
    """
    Fetches jobs for a user from Supabase.
    """
    return []

@router.post("/search", response_model=List[Job])
async def search_jobs(query: str):
    """
    Semantic search over scraped jobs using pgvector.
    """
    return []

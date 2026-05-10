from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException
from pydantic import BaseModel
import uuid
import logging
from agents.graph import graph
from middleware.auth import get_current_user_id
from services.redis import rate_limit_check

router = APIRouter(prefix="/v1/agents")
logger = logging.getLogger(__name__)

# Basic in-memory store for run statuses
runs = {}

class RunAgentRequest(BaseModel):
    query: str
    location: str
    resume: str = ""
    optimize_resume: bool = False

def execute_agent(run_id: str, req: RunAgentRequest):
    runs[run_id] = {"status": "running", "result": None}
    
    # Passing dummy raw jobs to test the LangGraph pipeline quickly
    # In production, we'd trigger scrapers here
    raw_jobs = [
        {"title": req.query, "company": "Example Corp", "location": req.location, "url": "http://example.com/1"},
        {"title": f"Sr {req.query}", "company": "Tech Inc", "location": "Remote", "url": "http://example.com/2"}
    ]
    
    initial_state = {
        "messages": [],
        "raw_jobs": raw_jobs,
        "filtered_jobs": [],
        "scored_jobs": [],
        "resume": req.resume,
        "optimized_resume": "",
        "user_preferences": {"location": req.location, "optimize_resume": req.optimize_resume}
    }
    
    try:
        final_state = graph.invoke(initial_state)
        runs[run_id] = {
            "status": "completed", 
            "result": {
                "jobs": final_state.get("scored_jobs", []),
                "optimized_resume": final_state.get("optimized_resume", "")
            }
        }
    except Exception as e:
        logger.error(f"Agent graph failed: {e}")
        runs[run_id] = {"status": "failed", "error": str(e)}

@router.post("/run")
async def run_agent(
    req: RunAgentRequest, 
    background_tasks: BackgroundTasks,
    user_id: str = Depends(get_current_user_id)
):
    # Rate limit: 5 agent runs per hour per user
    try:
        allowed = await rate_limit_check(user_id, limit=5, window=3600)
        if not allowed:
            raise HTTPException(status_code=429, detail="Rate limit exceeded. Max 5 agent runs per hour.")
    except HTTPException:
        raise
    except Exception as e:
        # If Redis is unavailable, log but allow the request
        logger.warning(f"Rate limit check failed (Redis may be down): {e}")
    
    run_id = str(uuid.uuid4())
    background_tasks.add_task(execute_agent, run_id, req)
    return {"run_id": run_id, "status": "started"}

@router.get("/status/{run_id}")
async def get_status(run_id: str):
    if run_id not in runs:
        return {"status": "not_found"}
    return runs[run_id]

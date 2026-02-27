from fastapi import APIRouter, BackgroundTasks
from pydantic import BaseModel
from typing import List
from app.agents.llm import get_llm
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import PydanticOutputParser
from app.models.agent import AgentRun, AgentState
from app.agents.supervisor import supervisor_app

router = APIRouter()

class RunRequest(BaseModel):
    user_id: str
    config: dict = {}

async def run_supervisor_task(user_id: str):
    print(f"Starting background supervisor for user: {user_id}")
    try:
        # In actual system, query supabase for new unseen jobs, run filters, etc.
        # Here we just initialize a fresh state
        state = AgentState(user_id=user_id, collected_jobs=[])
        # A full production system would fetch un-scored jobs and inject them
        final_state = await supervisor_app.ainvoke(state.model_dump())
        print(f"Finished background supervisor for user: {user_id}")
    except Exception as e:
        print(f"Supervisor task error: {e}")

@router.post("/run", response_model=AgentRun)
async def run_agent(request: RunRequest, background_tasks: BackgroundTasks):
    """
    Triggers the full multi-agent Supervisor pipeline in the background.
    """
    # Create the run record
    run = AgentRun(
        id="generated-uuid",
        user_id=request.user_id,
        status="pending",
        config=request.config,
        created_at="2023-01-01T00:00:00Z"
    )
    
    background_tasks.add_task(run_supervisor_task, request.user_id)
    
    return run

@router.get("/status/{run_id}", response_model=AgentRun)
async def get_agent_status(run_id: str):
    """
    Polls the status of an agent run.
    """
    # Temporary mock implementation
    return AgentRun(
        id=run_id,
        user_id="mock-user",
        status="completed",
        created_at="2023-01-01T00:00:00Z"
    )

@router.post("/feedback")
async def submit_feedback(run_id: str, feedback: dict):
    """
    Submits user feedback to the Learning Agent.
    """
    return {"status": "received"}

class DigestStats(BaseModel):
    user_id: str
    new_jobs_count: int
    saved_jobs_count: int
    applied_count: int

class DigestResponse(BaseModel):
    suggested_actions: List[str]

@router.post("/generate_digest", response_model=DigestResponse)
async def generate_digest(stats: DigestStats):
    """Generates daily digest suggestions based on pipeline statistics."""
    llm = get_llm()
    parser = PydanticOutputParser(pydantic_object=DigestResponse)
    prompt = ChatPromptTemplate.from_messages([
        ("system", "You are an AI career coach providing daily actionable advice to a job seeker.\n{format_instructions}"),
        ("user", "Daily Stats:\nNew Jobs found: {new_jobs_count}\nJobs in Pipeline: {saved_jobs_count}\nApplied this week: {applied_count}\n\nProvide 2-3 brief, actionable suggestions.")
    ])
    chain = prompt | llm | parser
    try:
        res = await chain.ainvoke({
            "new_jobs_count": stats.new_jobs_count,
            "saved_jobs_count": stats.saved_jobs_count,
            "applied_count": stats.applied_count,
            "format_instructions": parser.get_format_instructions()
        })
        return res
    except Exception as e:
        print(f"Digest generation error: {e}")
        return DigestResponse(suggested_actions=["Review your dashboard for fresh jobs.", "Follow up on previous applications."])

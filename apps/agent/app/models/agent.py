from typing import List, Optional, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field
from app.models.job import Job

class AgentTask(BaseModel):
    id: str
    run_id: str
    agent_type: str
    input: dict
    output: Optional[dict] = None
    status: str
    created_at: datetime
    completed_at: Optional[datetime] = None

class AgentRun(BaseModel):
    id: str
    user_id: str
    status: str = "pending"
    config: dict = Field(default_factory=dict)
    state: dict = Field(default_factory=dict)
    created_at: datetime
    completed_at: Optional[datetime] = None

# LangGraph Shared State
class AgentState(BaseModel):
    user_id: str
    collected_jobs: List[Job] = Field(default_factory=list)
    filtered_jobs: List[Job] = Field(default_factory=list)
    matched_jobs: List[Job] = Field(default_factory=list)
    resume_drafts: Dict[str, dict] = Field(default_factory=dict)
    messages: List[Any] = Field(default_factory=list)
    errors: List[str] = Field(default_factory=list)

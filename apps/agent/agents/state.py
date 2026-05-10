from typing import TypedDict, List, Annotated
from langchain_core.messages import AnyMessage

class AgentState(TypedDict):
    messages: List[AnyMessage]
    raw_jobs: List[dict]
    filtered_jobs: List[dict]
    scored_jobs: List[dict]
    resume: str
    optimized_resume: str
    user_preferences: dict

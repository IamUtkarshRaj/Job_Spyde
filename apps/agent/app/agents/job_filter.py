from typing import Dict, Any
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import PydanticOutputParser
from pydantic import BaseModel, Field
from app.models.agent import AgentState
from app.models.job import Job
from app.agents.llm import get_llm
from app.database import supabase

class FilterResult(BaseModel):
    is_match: bool = Field(description="True if the job passes the filter, False otherwise")
    reason: str = Field(description="Explanation for why it passed or failed")

async def job_filter_node(state: AgentState) -> Dict[str, Any]:
    """Filters collected jobs against basic user preferences."""
    print("--- FILTERING JOBS ---")
    
    llm = get_llm()
    parser = PydanticOutputParser(pydantic_object=FilterResult)
    
    prompt = ChatPromptTemplate.from_messages([
        ("system", "You are an AI assistant that evaluates if a job listing meets a user's basic criteria.\n{format_instructions}"),
        ("user", "User Preferences: {preferences}\n\nJob Title: {title}\nCompany: {company}\nLocation: {location}\nDescription: {description}\n\nDoes this job meet the user's basic criteria?")
    ])
    
    chain = prompt | llm | parser
    
    filtered_jobs = []
    
    # Fetch real user preferences from Supabase
    prefs_str = ""
    try:
        if state.user_id:
            profile_res = supabase.table('profiles').select('preferences').eq('id', state.user_id).execute()
            if profile_res.data and len(profile_res.data) > 0:
                prefs_str = str(profile_res.data[0].get('preferences', {}))
    except Exception as e:
        print("DB error fetching profiles: ", e)
    
    if not prefs_str:
        prefs_str = "No specific preferences given."
    
    for job in state.collected_jobs:
        try:
            result = await chain.ainvoke({
                "preferences": prefs_str,
                "title": job.title,
                "company": job.company,
                "location": job.location,
                "description": job.description[:1000],
                "format_instructions": parser.get_format_instructions()
            })
            
            if result.is_match:
                # Upgrade to full Job model
                job_dict = job.model_dump()
                full_job = Job(**job_dict, status="discovered")
                filtered_jobs.append(full_job)
        except Exception as e:
            print(f"Error filtering job {job.title}: {e}")
            
    return {"filtered_jobs": filtered_jobs}

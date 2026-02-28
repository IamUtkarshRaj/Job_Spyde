from typing import Dict, Any, List
import asyncio
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

async def filter_single_job(job: Any, prefs_str: str, roles_list: list, keywords_list: list, use_ai: bool = True) -> Job | None:
    """Evaluates a single job using AI or keyword fallback."""
    llm = get_llm()
    parser = PydanticOutputParser(pydantic_object=FilterResult)
    
    prompt = ChatPromptTemplate.from_messages([
        ("system", "You are an AI assistant that evaluates if a job listing meets a user's basic criteria.\n{format_instructions}"),
        ("user", "User Preferences: {preferences}\n\nJob Title: {title}\nCompany: {company}\nLocation: {location}\nDescription: {description}\n\nDoes this job meet the user's basic criteria?")
    ])
    
    chain = prompt | llm | parser

    try:
        if use_ai:
            result = await chain.ainvoke({
                "preferences": prefs_str,
                "title": job.title,
                "company": job.company,
                "location": job.location,
                "description": job.description[:1000],
                "format_instructions": parser.get_format_instructions()
            })
            
            if result.is_match:
                job_dict = job.model_dump()
                return Job(**job_dict, status="discovered")
            
            # If AI says no, continue to keyword fallback
        else:
            # AI disabled, continue to keyword fallback
            pass

    except Exception as e:
        print(f"AI Filter Error: {e}")
        # Continue to keyword fallback
        
    # Keyword Fallback
    text_to_search = f"{job.title} {job.description}".lower()
    match_found = False
    
    for role in roles_list:
        if role.lower() in text_to_search:
            match_found = True
            break
    
    if not match_found:
        for kw in keywords_list:
            if kw.lower() in text_to_search:
                match_found = True
                break
    
    if not match_found and any(r.lower() in job.title.lower() for r in roles_list):
        match_found = True

    if match_found:
        job_dict = job.model_dump()
        return Job(**job_dict, status="discovered")
            
    return None

async def job_filter_node(state: AgentState) -> Dict[str, Any]:
    """Filters collected jobs against basic user preferences."""
    print("--- FILTERING JOBS ---")
    
    # Fetch real user preferences from Supabase
    prefs_str = ""
    roles_list = []
    keywords_list = []
    try:
        if state.user_id:
            profile_res = supabase.table('profiles').select('preferences').eq('id', state.user_id).execute()
            if profile_res.data:
                prefs = profile_res.data[0].get('preferences', {})
                prefs_str = str(prefs)
                roles_list = prefs.get('roles', [])
                keywords_list = prefs.get('keywords', [])
    except Exception as e:
        print("DB error fetching profiles: ", e)
    
    if not prefs_str:
        prefs_str = "No specific preferences given."
    
    filtered_jobs = []
    
    # Process top 8
    jobs_to_process = state.collected_jobs[:8]
    
    for i, job in enumerate(jobs_to_process):
        res = await filter_single_job(
            job, 
            prefs_str, 
            roles_list, 
            keywords_list, 
            use_ai=(i < 3)
        )
        if res:
            filtered_jobs.append(res)
        if i < 3:
            await asyncio.sleep(0.5)
            
    return {"filtered_jobs": filtered_jobs}

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

async def filter_single_job(job: Any, prefs_str: str, roles_list: list, keywords_list: list, skills_list: list, locations_list: list, years_exp: str, use_ai: bool = True) -> Job | None:
    """Evaluates a single job using AI (with full profile metrics) or keyword fallback."""
    llm = get_llm()
    parser = PydanticOutputParser(pydantic_object=FilterResult)
    
    prompt = ChatPromptTemplate.from_messages([
        ("system", "You are a ruthlessly strict technical recruiter. You MUST reject (is_match=false) any job listing where the required years of experience clearly exceeds the user's '{years_exp}' years. Do not be lenient. You MUST also ensure the job title strictly aligns with the user's Target Roles. Evaluate skills and location. If the company is a startup, view that favorably.\n{format_instructions}"),
        ("user", "User Preferences: {preferences}\nTarget Roles: {roles}\nTarget Location: {locations}\nUser Skills: {skills}\nUser Years of Experience: {years_exp}\n\nJob Title: {title}\nCompany: {company}\nLocation: {location}\nJob Description: {description}\n\nIs this a perfect match? If the job requires significantly more experience than {years_exp} OR is not the right role, you MUST return False.")
    ])
    
    chain = prompt | llm | parser

    try:
        if use_ai:
            result = await chain.ainvoke({
                "preferences": prefs_str,
                "roles": ", ".join(roles_list),
                "locations": ", ".join(locations_list),
                "skills": ", ".join(skills_list),
                "years_exp": str(years_exp),
                "title": job.title,
                "company": job.company,
                "location": job.location,
                "description": job.description[:1000],
                "format_instructions": parser.get_format_instructions()
            })
            
            if result.is_match:
                job_dict = job.model_dump()
                return Job(**job_dict, status="discovered")
            else:
                # The AI actively evaluated and rejected the job (e.g., due to experience mismatch)
                # We must STRICTLY respect this and NOT allow keyword fallbacks to override it.
                return None
            
        else:
            # AI disabled, continue to keyword fallback
            pass

    except Exception as e:
        print(f"AI Filter Error: {e}")
        # Continue to keyword fallback
        
    # Keyword & Skill Fallback
    text_to_search = f"{job.title} {job.description}".lower()
    match_found = False
    
    for role in roles_list:
        if role.lower() in text_to_search:
            match_found = True
            break
            
    if not match_found and skills_list:
        for sk in skills_list:
            if sk.lower() in text_to_search:
                match_found = True
                break
    
    if not match_found:
        for kw in keywords_list:
            if kw.lower() in text_to_search:
                match_found = True
                break
    
    if not match_found and any(r.lower() in job.title.lower() for r in roles_list):
        match_found = True

    if match_found and years_exp:
        title_lower = job.title.lower()
        if "entry" in years_exp.lower() or "0-2" in years_exp:
            if any(w in title_lower for w in ["senior", "sr.", "sr ", "lead", "director", "manager", "staff", "principal"]):
                match_found = False
        elif "mid" in years_exp.lower() or "2-5" in years_exp:
            if any(w in title_lower for w in ["director", "head", "vp", "chief"]):
                match_found = False
                
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
            skills_list=[], 
            locations_list=[], 
            years_exp="", 
            use_ai=(i < 3)
        )
        if res:
            filtered_jobs.append(res)
        if i < 3:
            await asyncio.sleep(0.5)
            
    return {"filtered_jobs": filtered_jobs}

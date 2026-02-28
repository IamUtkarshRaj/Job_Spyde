from typing import Dict, Any
import asyncio
from pydantic import BaseModel, Field
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import PydanticOutputParser
from app.models.agent import AgentState
from app.agents.llm import get_llm
from app.database import supabase

class MatchScore(BaseModel):
    score: int = Field(description="Match score from 0-100")
    reasoning: str = Field(description="Explanation of the score and specific skill overlaps or gaps")

async def match_single_job(job: Any, resume_text: str, score_threshold: int = 60, use_ai: bool = True) -> Any | None:
    """Scores a single job using AI or default fallback."""
    llm = get_llm()
    parser = PydanticOutputParser(pydantic_object=MatchScore)
    
    prompt = ChatPromptTemplate.from_messages([
        ("system", "You are an expert technical recruiter matching candidates to jobs.\nEvaluate the match between the resume and job description. Assign a score from 0-100.\n{format_instructions}"),
        ("user", "Candidate Resume: {resume}\n\nJob Title: {title}\nCompany: {company}\nDescription: {description}\n\nAnalyze the match and provide a score.")
    ])
    
    chain = prompt | llm | parser

    try:
        if use_ai:
            result = await chain.ainvoke({
                "resume": resume_text,
                "title": job.title,
                "company": job.company,
                "description": job.description[:1500],
                "format_instructions": parser.get_format_instructions()
            })
            
            job.match_score = result.score
            if result.score >= score_threshold:
                return job
            
            # If AI score is low, we still return it but it might be filtered by the caller
            return job
        else:
            # AI disabled, use default score
            job.match_score = 75
            return job

    except Exception as e:
        print(f"AI Match Error: {e}")
        # Default fallback score
        job.match_score = 70
        return job
            
    return None

async def job_matching_node(state: AgentState) -> Dict[str, Any]:
    """Scores filtered jobs against user's resume and preferences."""
    print("--- MATCHING JOBS ---")
    
    if not state.filtered_jobs:
        return {"matched_jobs": []}
    
    # Fetch real user resume from Supabase
    resume_text = "Standard professional resume text."
    try:
        if state.user_id:
            resume_res = supabase.table('resumes').select('resume_text').eq('user_id', state.user_id).order('created_at', desc=True).limit(1).execute()
            if resume_res.data:
                resume_text = resume_res.data[0].get('resume_text', resume_text)
    except Exception as e:
        print("DB error fetching resumes: ", e)
    
    matched_jobs = []
    
    # Process all filtered jobs
    for i, job in enumerate(state.filtered_jobs):
        res = await match_single_job(
            job, 
            resume_text, 
            use_ai=(i < 3)
        )
        if res:
            matched_jobs.append(res)
        if i < 3:
            await asyncio.sleep(0.5)
            
    # Sort by descending match score
    matched_jobs.sort(key=lambda x: x.match_score or 0, reverse=True)
            
    return {"matched_jobs": matched_jobs}

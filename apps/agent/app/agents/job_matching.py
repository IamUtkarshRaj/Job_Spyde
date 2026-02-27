from typing import Dict, Any
from pydantic import BaseModel, Field
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import PydanticOutputParser
from app.models.agent import AgentState
from app.agents.llm import get_llm
from app.database import supabase

class MatchScore(BaseModel):
    score: int = Field(description="Match score from 0-100")
    reasoning: str = Field(description="Explanation of the score and specific skill overlaps or gaps")

async def job_matching_node(state: AgentState) -> Dict[str, Any]:
    """Scores filtered jobs against user's resume and preferences."""
    print("--- MATCHING JOBS ---")
    
    if not state.filtered_jobs:
        return {"matched_jobs": []}
    
    llm = get_llm()
    parser = PydanticOutputParser(pydantic_object=MatchScore)
    
    prompt = ChatPromptTemplate.from_messages([
        ("system", "You are an expert technical recruiter matching candidates to jobs.\nEvaluate the match between the resume and job description. Assign a score from 0-100.\n{format_instructions}"),
        ("user", "Candidate Resume: {resume}\n\nJob Title: {title}\nCompany: {company}\nDescription: {description}\n\nAnalyze the match and provide a score.")
    ])
    
    chain = prompt | llm | parser
    
    matched_jobs = []
    
    # Fetch real user resume from Supabase
    resume_text = "Standard professional resume text."
    try:
        if state.user_id:
            resume_res = supabase.table('resumes').select('resume_text').eq('user_id', state.user_id).order('created_at', desc=True).limit(1).execute()
            if resume_res.data and len(resume_res.data) > 0:
                resume_text = resume_res.data[0].get('resume_text', resume_text)
    except Exception as e:
        print("DB error fetching resumes: ", e)
    
    for job in state.filtered_jobs:
        try:
            result = await chain.ainvoke({
                "resume": resume_text,
                "title": job.title,
                "company": job.company,
                "description": job.description[:1500],
                "format_instructions": parser.get_format_instructions()
            })
            
            job.match_score = result.score
            # Optional: store reasoning in metadata or logs
            print(f"Job: {job.title} | Score: {result.score} | Reason: {result.reasoning}")
            
            if result.score >= 60:  # Threshold
                matched_jobs.append(job)
                
        except Exception as e:
            print(f"Error matching job {job.title}: {e}")
            
    # Sort by descending match score
    matched_jobs.sort(key=lambda x: x.match_score or 0, reverse=True)
            
    return {"matched_jobs": matched_jobs}

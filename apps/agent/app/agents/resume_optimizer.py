from typing import Dict, Any
from app.models.agent import AgentState
from app.models.user import ResumeDraft
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import PydanticOutputParser
from app.agents.llm import get_llm

async def resume_optimizer_node(state: AgentState) -> Dict[str, Any]:
    """Tailors the user's base resume for the top matched jobs."""
    print("--- OPTIMIZING RESUMES ---")
    
    if not state.matched_jobs:
        return {"resume_drafts": {}}
        
    llm = get_llm()
    parser = PydanticOutputParser(pydantic_object=ResumeDraft)
    
    prompt = ChatPromptTemplate.from_messages([
        ("system", "You are an expert career coach. Tailor the candidate's resume summary and bullet points for the specific job description.\n{format_instructions}"),
        ("user", "Base Resume: {resume}\n\nTarget Job:\nTitle: {title}\nCompany: {company}\nDescription: {description}")
    ])
    
    chain = prompt | llm | parser
    drafts = {}
    
    dummy_resume = "Software Engineer. Built APIs."
    
    # Only optimize top 3 to save time/tokens during PoC
    for job in state.matched_jobs[:3]:
        try:
            result = await chain.ainvoke({
                "resume": dummy_resume,
                "title": job.title,
                "company": job.company,
                "description": job.description[:1500],
                "format_instructions": parser.get_format_instructions()
            })
            
            drafts[job.id or job.url] = result.model_dump()
            print(f"Created draft for {job.company}")
            
        except Exception as e:
            print(f"Error optimizing resume for {job.title}: {e}")
            
    return {"resume_drafts": drafts}

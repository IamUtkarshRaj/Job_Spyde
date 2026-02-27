from fastapi import APIRouter
from pydantic import BaseModel
from app.models.user import ResumeDraft
from app.agents.llm import get_llm
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import PydanticOutputParser

router = APIRouter()

class SetupResumeRequest(BaseModel):
    user_profile: dict
    base_resume_text: str
    job_description: str
    job_title: str
    company: str

@router.post("/optimize", response_model=ResumeDraft)
async def optimize_resume(request: SetupResumeRequest):
    """
    Tailors a resume for a specific job matching frontend payload.
    """
    llm = get_llm()
    parser = PydanticOutputParser(pydantic_object=ResumeDraft)
    prompt = ChatPromptTemplate.from_messages([
        ("system", "You are an expert career coach. Tailor the candidate's resume for the specific job description.\n{format_instructions}"),
        ("user", "Base Resume: {resume}\nUser Prefs: {prefs}\n\nTarget Job ({title} at {company}):\n{description}\n\nTailor the resume.")
    ])
    chain = prompt | llm | parser
    try:
        res = await chain.ainvoke({
            "resume": request.base_resume_text,
            "prefs": str(request.user_profile),
            "title": request.job_title,
            "company": request.company,
            "description": request.job_description[:2000] if request.job_description else "",
            "format_instructions": parser.get_format_instructions()
        })
        return res
    except Exception as e:
        print(f"Resume Optimization Error: {e}")
        return ResumeDraft(
            summary="Failed to generate optimal summary.",
            tailored_bullets=[],
            skills_to_highlight=[],
            cover_letter_paragraph="Error rendering cover letter snippet."
        )

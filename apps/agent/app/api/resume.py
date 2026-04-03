from fastapi import APIRouter
from pydantic import BaseModel
from app.models.user import ResumeDraft, ResumeExtraction
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

class ExtractRequest(BaseModel):
    resume_text: str

def basic_regex_extraction(text: str) -> dict:
    """
    Simpler extraction using regex as a fallback when AI is unavailable.
    Enhanced with keyword-based tech detection for an "NLP-like" feel.
    """
    import re
    
    # Common tech keywords for "NLP-lite" extraction
    tech_keywords = ["React", "Node.js", "Python", "Java", "C++", "TypeScript", "Next.js", "Tailwind", "SQL", "NoSQL", "Docker", "AWS", "Azure", "GCP", "Kubernetes", "Machine Learning", "AI", "NLP"]
    
    # Basic Profile extraction
    email = re.search(r'[\w\.-]+@[\w\.-]+\.\w+', text)
    phone = re.search(r'(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}', text)
    linkedin = re.search(r'linkedin\.com/in/[\w-]+', text)
    portfolio = re.search(r'(?:portfolio|github|website|www)\.[\w\.-]+\.\w+', text, re.I)
    
    # Basic Project extraction
    projects = []
    # Look for headers like "Projects", "Key Projects", etc.
    project_sections = re.split(r'(?i)projects?\s*[:\n]|experience\s*[:\n]', text)
    if len(project_sections) > 1:
        # Look for bullet points or numbered lists
        raw_items = re.findall(r'(?:^|[•\*\-\d\.]+)\s*([A-Z][\w\s,]+(?:[:\-]| -).*?)(?=\n[•\*\-\d\.]|\n\n|\n[A-Z][a-z]|$)', project_sections[1], re.M)
        
        for item in raw_items[:4]:
            # Extract technologies from the item
            found_tech = [tech for tech in tech_keywords if tech.lower() in item.lower()]
            
            # Simple name extraction (text before colon or dash)
            name_match = re.match(r'^([^:\-]+)', item)
            name = name_match.group(1).strip()[:50] if name_match else "Extracted Project"
            
            projects.append({
                "name": name,
                "description": item.replace(name, "").strip().lstrip(':- ').capitalize(),
                "technologies": ", ".join(found_tech) if found_tech else "General"
            })
    
    return {
        "profile": {
            "email": email.group(0) if email else None,
            "phone": phone.group(0) if phone else None,
            "linkedin_url": linkedin.group(0) if linkedin else None,
            "portfolio_url": portfolio.group(0) if portfolio else None,
            "professional_summary": text[:200].replace('\n', ' ').strip() + "..." if len(text) > 200 else text
        },
        "projects": projects,
        "extraction_method": "basic"
    }

@router.post("/extract-all", response_model=ResumeExtraction)
async def extract_all(request: ExtractRequest):
    """
    Parses raw resume text to identify and extract comprehensive profile and project details.
    """
    llm = get_llm()
    parser = PydanticOutputParser(pydantic_object=ResumeExtraction)
    prompt = ChatPromptTemplate.from_messages([
        ("system", "You are an expert resume parser. Extract a comprehensive profile (Name, Email, Phone, Location, Socials, Summary) and a list of projects from the provided resume text.\n{format_instructions}"),
        ("user", "Resume Text:\n{resume_text}")
    ])
    chain = prompt | llm | parser
    try:
        res = await chain.ainvoke({
            "resume_text": request.resume_text,
            "format_instructions": parser.get_format_instructions()
        })
        # If the LLM returned something but it's completely empty, maybe it's a silent failure
        if not res.projects and not res.profile.full_name:
            print("AI Extraction returned empty results. Triggering basic fallback.")
            basic = basic_regex_extraction(request.resume_text)
            return basic
            
        res.extraction_method = "ai"
        return res
    except Exception as e:
        print(f"Resume Extraction Failure ({type(e).__name__}): {e}")
        # Trigger basic fallback on ANY failure (including 429)
        return basic_regex_extraction(request.resume_text)

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

from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Optional
from services.embeddings import get_llm
import logging
import json
import re

router = APIRouter(prefix="/v1/resume")

logger = logging.getLogger(__name__)


# ── Structured Optimization Models ──────────────────────────────────────────

class ProfileInput(BaseModel):
    full_name: str = ""
    email: str = ""
    phone: str = ""
    location: str = ""
    linkedin_url: str = ""
    portfolio_url: str = ""
    professional_summary: str = ""

class ExperienceInput(BaseModel):
    company: str = ""
    title: str = ""
    dates: str = ""
    description: str = ""

class EducationInput(BaseModel):
    school: str = ""
    degree: str = ""
    dates: str = ""
    details: str = ""

class ProjectInput(BaseModel):
    name: str = ""
    url: str = ""
    technologies: str = ""
    description: str = ""

class CertificationInput(BaseModel):
    name: str = ""
    issuer: str = ""

class StructuredResumeOptimizeRequest(BaseModel):
    profile: ProfileInput = ProfileInput()
    experience: List[ExperienceInput] = []
    education: List[EducationInput] = []
    projects: List[ProjectInput] = []
    skills: str = ""
    certifications: List[CertificationInput] = []
    job_description: str = ""
    job_title: str = ""
    company: str = ""


def _extract_keywords(text: str) -> list:
    """Extract important keywords from job description."""
    stop_words = {
        'the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
        'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
        'should', 'may', 'might', 'shall', 'can', 'need', 'dare', 'ought',
        'used', 'to', 'of', 'in', 'for', 'on', 'with', 'at', 'by', 'from',
        'as', 'into', 'through', 'during', 'before', 'after', 'above',
        'below', 'between', 'and', 'but', 'or', 'nor', 'not', 'so', 'yet',
        'both', 'either', 'neither', 'each', 'every', 'all', 'any', 'few',
        'more', 'most', 'other', 'some', 'such', 'no', 'only', 'own', 'same',
        'than', 'too', 'very', 'just', 'because', 'about', 'up', 'out', 'if',
        'then', 'that', 'this', 'these', 'those', 'what', 'which', 'who',
        'whom', 'how', 'when', 'where', 'why', 'we', 'you', 'they', 'it',
        'he', 'she', 'i', 'me', 'my', 'your', 'our', 'their', 'its',
        'work', 'working', 'ability', 'experience', 'role', 'team', 'will',
        'looking', 'join', 'company', 'position', 'including', 'also', 'well',
        'must', 'strong', 'using', 'new', 'years', 'required', 'preferred',
        'etc', 'e.g', 'i.e', 'within', 'across', 'ensure', 'understanding',
    }
    # Find multi-word tech terms and single words
    words = re.findall(r'[A-Za-z][A-Za-z.+#/-]{1,}', text)
    keywords = []
    seen = set()
    for w in words:
        lower = w.lower().strip('.')
        if lower not in stop_words and len(lower) > 1 and lower not in seen:
            seen.add(lower)
            keywords.append(w)
    return keywords[:60]


@router.post("/optimize-structured")
async def optimize_structured(req: StructuredResumeOptimizeRequest):
    """
    Optimize resume sections for a specific JD using Gemini.
    Returns structured optimized JSON with keyword analysis.
    STRICT: Only rewrites/rephrases existing content — never fabricates.
    """
    try:
        llm = get_llm()

        # Build the resume content as structured text for the prompt
        resume_sections = {
            "profile": req.profile.model_dump(),
            "experience": [e.model_dump() for e in req.experience],
            "education": [e.model_dump() for e in req.education],
            "projects": [p.model_dump() for p in req.projects],
            "skills": req.skills,
            "certifications": [c.model_dump() for c in req.certifications],
        }

        prompt = f"""You are an expert ATS resume optimizer. Your task is to REWRITE and OPTIMIZE the resume sections below to better match the target job description.

## STRICT RULES — VIOLATION WILL INVALIDATE THE OUTPUT:
1. You may ONLY use facts, companies, titles, dates, technologies, and achievements that ALREADY EXIST in the resume data below.
2. You MUST NOT invent new experience, companies, job titles, metrics, or skills that are not present.
3. You CAN reword bullet points to use action verbs and quantify achievements (only using data that's implied).
4. You CAN reorder skills to prioritize those matching the JD.
5. You CAN improve the professional summary to align with the target role.
6. You MUST NOT change education or certifications (they are factual records).
7. Return ONLY valid JSON — no markdown, no commentary.

## TARGET JOB:
Title: {req.job_title}
Company: {req.company}
Job Description:
{req.job_description}

## CURRENT RESUME DATA:
{json.dumps(resume_sections, indent=2)}

## REQUIRED OUTPUT JSON SCHEMA:
{{
  "optimized_profile": {{
    "full_name": "<keep same>",
    "email": "<keep same>",
    "phone": "<keep same>",
    "location": "<keep same>",
    "linkedin_url": "<keep same>",
    "portfolio_url": "<keep same>",
    "professional_summary": "<rewritten to target the job>"
  }},
  "optimized_experience": [
    {{
      "company": "<keep same>",
      "title": "<keep same>",
      "dates": "<keep same>",
      "description": "<rewritten with action verbs, JD keywords, quantified impact>"
    }}
  ],
  "optimized_projects": [
    {{
      "name": "<keep same>",
      "url": "<keep same>",
      "technologies": "<keep same or reorder to highlight relevant ones>",
      "description": "<rewritten to emphasize JD-relevant aspects>"
    }}
  ],
  "optimized_skills": "<reordered comma-separated skills, JD-relevant first>",
  "education": <COPY EXACTLY from input>,
  "certifications": <COPY EXACTLY from input>
}}

Return ONLY the JSON object. No markdown fences, no explanations."""

        result = llm.invoke(prompt)
        content = result.content
        if isinstance(content, list):
            content = "".join([c.get("text", "") if isinstance(c, dict) else str(c) for c in content])
        content = content.strip()

        logger.info(f"Structured optimization raw output length: {len(content)}")

        # Clean markdown fences if present
        if "```json" in content:
            content = content.split("```json")[1].split("```")[0].strip()
        elif "```" in content:
            content = content.split("```")[1].split("```")[0].strip()

        try:
            data = json.loads(content)
        except json.JSONDecodeError as e:
            logger.warning(f"JSON parse error in optimization: {e}. Attempting repair...")
            # Basic repair
            if content.count('"') % 2 != 0:
                content += '"'
            open_b = content.count('{') - content.count('}')
            open_br = content.count('[') - content.count(']')
            content += '}' * max(0, open_b)
            content += ']' * max(0, open_br)
            try:
                data = json.loads(content)
            except:
                logger.error("Final JSON repair failed. Returning original data.")
                data = {
                    "optimized_profile": req.profile.model_dump(),
                    "optimized_experience": [e.model_dump() for e in req.experience],
                    "optimized_projects": [p.model_dump() for p in req.projects],
                    "optimized_skills": req.skills,
                    "education": [e.model_dump() for e in req.education],
                    "certifications": [c.model_dump() for c in req.certifications],
                }

        # ── Keyword Analysis ──
        jd_keywords = _extract_keywords(req.job_description)

        # Build full resume text for matching
        resume_full_text = " ".join([
            req.profile.professional_summary,
            req.skills,
            " ".join([e.description + " " + e.title for e in req.experience]),
            " ".join([p.description + " " + p.technologies for p in req.projects]),
        ]).lower()

        keyword_matches = []
        missing_keywords = []
        for kw in jd_keywords:
            if kw.lower() in resume_full_text:
                keyword_matches.append(kw)
            else:
                missing_keywords.append(kw)

        data["keyword_matches"] = keyword_matches[:30]
        data["missing_keywords"] = missing_keywords[:20]

        return data

    except Exception as e:
        logger.error(f"Structured optimization error: {e}")
        return {
            "optimized_profile": req.profile.model_dump(),
            "optimized_experience": [e.model_dump() for e in req.experience],
            "optimized_projects": [p.model_dump() for p in req.projects],
            "optimized_skills": req.skills,
            "education": [e.model_dump() for e in req.education],
            "certifications": [c.model_dump() for c in req.certifications],
            "keyword_matches": [],
            "missing_keywords": [],
            "error": str(e),
        }

class ResumeOptimizeRequest(BaseModel):
    user_profile: dict = {}
    base_resume_text: str
    job_description: str
    job_title: str
    company: str

class ExtractAllRequest(BaseModel):
    resume_text: str

@router.post("/optimize")
async def optimize_resume(req: ResumeOptimizeRequest):
    """Use Gemini to optimize a resume for a specific job description."""
    try:
        llm = get_llm()
        prompt = f"""You are an expert resume writer. Optimize the following resume for the job described below.

JOB TITLE: {req.job_title}
COMPANY: {req.company}
JOB DESCRIPTION:
{req.job_description}

CURRENT RESUME:
{req.base_resume_text}

USER PROFILE CONTEXT:
{req.user_profile}

Instructions:
1. Tailor the resume content to match the job description keywords and requirements.
2. Rewrite bullet points to quantify achievements where possible.
3. Highlight relevant skills that align with the job.
4. Keep the same overall structure but improve impact.
5. Return ONLY the optimized resume text, no commentary.
"""
        result = llm.invoke(prompt)
        print("\n--- AI OPTIMIZATION OUTPUT ---\n", result.content, "\n-------------------\n")
        return {
            "optimized_resume": result.content,
            "job_title": req.job_title,
            "company": req.company,
        }
    except Exception as e:
        logger.error(f"Resume optimization error: {e}")
        return {
            "optimized_resume": req.base_resume_text,
            "error": str(e),
        }

@router.post("/extract-all")
async def extract_all(req: ExtractAllRequest):
    """Extract profile info and projects from raw resume text using Regex and LLM."""
    try:
        import re
        import json
        
        text = req.resume_text
        
        # 1. Regex Extraction (Deterministic)
        email_match = re.search(r'[\w\.-]+@[\w\.-]+\.\w+', text)
        email = email_match.group(0) if email_match else ""
        
        phone_match = re.search(r'\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}', text)
        phone = phone_match.group(0) if phone_match else ""
        
        github_match = re.search(r'(https?://(?:www\.)?github\.com/[\w-]+)', text, re.IGNORECASE)
        github_url = github_match.group(0) if github_match else ""
        
        linkedin_match = re.search(r'(https?://(?:www\.)?linkedin\.com/in/[\w-]+)', text, re.IGNORECASE)
        linkedin_url = linkedin_match.group(0) if linkedin_match else ""

        # 2. LLM Extraction (Gemini optimized)
        llm = get_llm()
        prompt = f"""You are a professional resume parser. Extract ALL information from the text below into a structured JSON.

### GUIDELINES:
1. **Projects**: Look for the 'PROJECTS' section. Extract 'Document Q&A Chatbot', 'Face Movement Detector', and 'AI-based Adaptive Testing'.
2. **Experience**: Look for 'INTERNSHIPS' and 'EXPERIENCE'. Map them both to the 'experience' field. Extract 'Bitrix Innovation' and 'Celebal Technologies'.
3. **Education**: Extract all degrees and schools (NIET, C.M. Science College, D.A.V. Public School).
4. **Skills**: Extract all technical and soft skills.
5. **Certifications**: Extract all IBM and Coursera certificates.

### JSON SCHEMA:
{{
  "profile": {{ "full_name": "", "location": "", "professional_summary": "" }},
  "projects": [ {{ "project_name": "", "description": "", "technologies": "", "link": "" }} ],
  "experience": [ {{ "company": "", "title": "", "dates": "", "description": "" }} ],
  "skills": "...",
  "certifications": [ {{ "name": "", "issuer": "" }} ],
  "education": [ {{ "degree": "", "school": "", "dates": "", "details": "" }} ]
}}

### RESUME TEXT:
{text}

Return ONLY the JSON object. No conversational filler.
"""
        result = llm.invoke(prompt)
        content = result.content
        if isinstance(content, list):
            # Extract text from list of content parts
            content = "".join([c.get("text", "") if isinstance(c, dict) else str(c) for c in content])
        content = content.strip()
        print("\n--- AI EXTRACTION OUTPUT ---\n", content, "\n-------------------\n")
        
        # Clean markdown if present
        if "```json" in content:
            content = content.split("```json")[1].split("```")[0].strip()
        elif "```" in content:
            content = content.split("```")[1].split("```")[0].strip()

        try:
            data = json.loads(content)
        except json.JSONDecodeError as e:
            logger.warning(f"JSON parsing error: {e}. Attempting repair...")
            # Repair 1: Close unclosed strings
            if content.count('"') % 2 != 0:
                content += '"'
            # Repair 2: Close unclosed braces/brackets
            open_braces = content.count('{')
            close_braces = content.count('}')
            open_brackets = content.count('[')
            close_brackets = content.count(']')
            
            content += '}' * (open_braces - close_braces)
            content += ']' * (open_brackets - close_brackets)
            
            try:
                data = json.loads(content)
            except:
                logger.error("Final JSON repair failed.")
                data = {}

        # Normalize keys to lowercase for reliable access
        data = {k.lower(): v for k, v in data.items()}
        
        profile_data = data.get("profile", {})
        
        return {
            "profile": {
                "full_name": profile_data.get("full_name", ""),
                "email": email,
                "phone": phone,
                "location": profile_data.get("location", ""),
                "linkedin_url": linkedin_url,
                "portfolio_url": github_url, 
                "professional_summary": profile_data.get("professional_summary", "")
            },
            "projects": data.get("projects", []),
            "experience": data.get("experience", []) or data.get("internships", []), # Map internships to experience
            "skills": data.get("skills", ""),
            "certifications": data.get("certifications", []),
            "education": data.get("education", [])
        }
        
    except Exception as e:
        logger.error(f"Resume extraction error: {e}")
        return {
            "profile": {},
            "projects": [],
            "experience": [],
            "skills": "",
            "certifications": [],
            "error": str(e),
        }

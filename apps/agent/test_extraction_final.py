import asyncio
import json
from routers.resume import extract_all, ExtractAllRequest

async def test_extraction():
    sample_resume = """
    UTKARSH RAJ
    Email: utkarsh@example.com
    Phone: 123-456-7890
    LinkedIn: linkedin.com/in/utkarsh
    
    PROFESSIONAL SUMMARY
    Senior Software Engineer with 5 years of experience in AI and Web Development.
    
    EXPERIENCE
    Google - Software Engineer (2020 - Present)
    Developed large scale AI agents.
    
    PROJECTS
    JobSpyde - Autonomous job tracking engine using Python and React.
    
    SKILLS
    Python, React, Node.js, PostgreSQL
    
    CERTIFICATIONS
    AWS Certified Solutions Architect
    """
    
    req = ExtractAllRequest(resume_text=sample_resume)
    try:
        result = await extract_all(req)
        print("Extraction Result:")
        print(json.dumps(result, indent=2))
    except Exception as e:
        print(f"Extraction Failed: {e}")

if __name__ == "__main__":
    asyncio.run(test_extraction())

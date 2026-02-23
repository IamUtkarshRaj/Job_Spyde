import os
import random
import requests
from typing import List, Optional
from bs4 import BeautifulSoup
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from dotenv import load_dotenv

from duckduckgo_search import DDGS
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import JsonOutputParser

load_dotenv()

app = FastAPI(title="Student Job Agent Service")

# --- Models ---

class UserProfile(BaseModel):
    roles: List[str]
    locations: List[str]
    remote_preference: bool
    keywords: List[str]

class Job(BaseModel):
    title: str = Field(description="The job title")
    company: str = Field(description="The company name")
    location: str = Field(description="Job location, e.g. 'Remote', 'San Francisco, CA'")
    source: str = Field(description="Source website name, e.g. 'LinkedIn', 'Indeed', 'Company Site'")
    description: str = Field(description="A brief summary of the job description (2-3 sentences)")
    posted_at: str = Field(description="Date posted relative or absolute, e.g. '2 days ago'")
    match_score: int = Field(description="A score from 0-100 indicating match quality")
    url: str = Field(description="The direct URL to the job posting")

class GenerateResumeRequest(BaseModel):
    user_profile: UserProfile
    base_resume_text: str
    job_description: str
    job_title: str
    company: str

class ResumeDraft(BaseModel):
    summary: str
    tailored_bullets: List[str]
    skills_to_highlight: List[str]
    cover_letter_paragraph: str

class DigestRequest(BaseModel):
    user_id: str
    new_jobs_count: int
    saved_jobs_count: int
    applied_count: int

class DigestResponse(BaseModel):
    suggested_actions: List[str]

# --- Helpers ---

def scrape_text(url: str, max_chars: int = 4000) -> str:
    """Scrapes visible text from a URL, limited to max_chars."""
    try:
        headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'}
        response = requests.get(url, headers=headers, timeout=5)
        response.raise_for_status()
        soup = BeautifulSoup(response.text, 'html.parser')
        
        # Remove scripts and styles
        for script in soup(["script", "style", "nav", "footer"]):
            script.decompose()
            
        text = soup.get_text(separator=' ', strip=True)
        return text[:max_chars]
    except Exception as e:
        print(f"Failed to scrape {url}: {e}")
        return ""

# --- Endpoints ---

@app.get("/health")
def health_check():
    return {"status": "ok"}

@app.post("/v1/discover_jobs", response_model=List[Job])
def discover_jobs(profile: UserProfile):
    """
    1. Generates a search query from profile.
    2. Searches DuckDuckGo for job listings.
    3. Scrapes top results.
    4. Uses Gemini to extract structured Job objects.
    """
    api_key = os.getenv("GOOGLE_API_KEY")
    if not api_key:
        print("Warning: GOOGLE_API_KEY not found. Returning mock data.")
        # Fallback to mock if no key
        return [
            Job(
                title="Software Engineer Intern (Mock)",
                company="TechCorp",
                location="San Francisco, CA",
                source="MockSource",
                description="This is a fallback mock job because the API key is missing.",
                posted_at="Just now",
                match_score=95,
                url="https://example.com/mock"
            )
        ]

    # 1. Generate Search Query
    query_terms = " ".join(profile.roles[:2])
    locations = " ".join(profile.locations[:1])
    keywords = " ".join(profile.keywords[:2])
    remote = "Remote" if profile.remote_preference else ""
    
    search_query = f"site:linkedin.com/jobs OR site:indeed.com/jobs OR site:greenhouse.io {query_terms} {locations} {remote} {keywords} internship entry level"
    
    print(f"Searching for: {search_query}")
    
    try:
        # 2. Search DuckDuckGo (Direct API)
        with DDGS() as ddgs:
            raw_results = list(ddgs.text(search_query, max_results=5))
        
        print(f"Found {len(raw_results)} results.")
        
        if not raw_results:
            return []

        # 3. Parse with Gemini
        # We can either fetch content or just use search snippets. 
        # For speed and robustness (fetching often fails on LinkedIn/Indeed due to anti-bot), 
        # let's try to extract from snippets first. If snippets are too short, fetch.
        # But for 'best result' structure requested, let's try to use the snippet context + URL.
        
        llm = ChatGoogleGenerativeAI(model="gemini-pro", google_api_key=api_key)
        parser = JsonOutputParser(pydantic_object=Job)

        prompt = ChatPromptTemplate.from_messages([
            ("system", "You are a job extraction agent. Extract job listings from the provided search results. Return a JSON list of objects matching the schema."),
            ("user", "User Profile: {profile}\n\nSearch Results:\n{results}\n\nExtract distinct job listings found in these results. If details are missing, infer reasonable summaries from the snippets. Ignoring generic portal links. Format the output as a JSON list.")
        ])
        
        chain = prompt | llm | parser
        
        jobs_data = chain.invoke({
            "profile": profile.model_dump_json(),
            "results": raw_results
        })
        
        # Ensure it's a list
        if isinstance(jobs_data, dict):
            jobs_data = [jobs_data]
            
        jobs = [Job(**j) for j in jobs_data if isinstance(j, dict)]
        return jobs

    except Exception as e:
        print(f"Error during discovery: {e}")
        # Return fallback/mock on error to keep UI working
        return []

@app.post("/v1/generate_resume", response_model=ResumeDraft)
def generate_resume(request: GenerateResumeRequest):
    return ResumeDraft(
        summary=f"Motivated {request.job_title} candidate.",
        tailored_bullets=["Strong skills.", "Great fit."],
        skills_to_highlight=["Python", "Communication"],
        cover_letter_paragraph=f"I am interested in {request.company}."
    )

@app.post("/v1/generate_digest", response_model=DigestResponse)
def generate_digest(request: DigestRequest):
    return DigestResponse(suggested_actions=["Check new jobs.", "Update profile."])
 

from typing import List, Optional
from pydantic import BaseModel, Field
from datetime import datetime

class UserProfile(BaseModel):
    id: str
    preferences: dict = Field(default_factory=dict)
    created_at: Optional[datetime] = None

class Resume(BaseModel):
    id: Optional[str] = None
    user_id: str
    storage_path: str
class Project(BaseModel):
    name: str
    url: Optional[str] = None
    technologies: Optional[str] = None
    description: Optional[str] = None

class ProfileExtraction(BaseModel):
    full_name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    location: Optional[str] = None
    linkedin_url: Optional[str] = None
    portfolio_url: Optional[str] = None
    professional_summary: Optional[str] = None

class ResumeExtraction(BaseModel):
    profile: ProfileExtraction
    projects: List[Project]
    extraction_method: str = "ai" # "ai" or "basic"

class ResumeDraft(BaseModel):
    summary: str
    tailored_bullets: List[str]
    skills_to_highlight: List[str]
    cover_letter_paragraph: str

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
    resume_text: str
    created_at: Optional[datetime] = None

class ResumeDraft(BaseModel):
    summary: str
    tailored_bullets: List[str]
    skills_to_highlight: List[str]
    cover_letter_paragraph: str

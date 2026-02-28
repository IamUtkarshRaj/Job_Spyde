from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel, Field

class JobFilter(BaseModel):
    user_id: Optional[str] = Field(description="User ID for fetching profile/resume", default=None)
    roles: List[str] = Field(description="Target job roles (e.g. Software Engineer)")
    locations: List[str] = Field(description="Target locations")
    remote: bool = Field(description="Whether remote is preferred", default=False)
    keywords: List[str] = Field(description="Keywords to look for in description", default_factory=list)
    experience_level: Optional[str] = Field(description="Entry, Mid, Senior, etc.", default=None)

class CollectedJob(BaseModel):
    title: str
    company: str
    location: str
    source: str
    url: str
    description: str
    posted_at: str
    metadata: dict = Field(default_factory=dict)

class Job(CollectedJob):
    id: Optional[str] = None
    user_id: Optional[str] = None
    match_score: Optional[int] = Field(description="A score from 0-100 indicating match quality", default=None)
    status: str = Field(description="discovered, saved, prepared, applied, etc.", default="discovered")
    created_at: Optional[datetime] = None

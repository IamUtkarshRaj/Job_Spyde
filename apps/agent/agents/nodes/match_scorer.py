from agents.state import AgentState
from services.embeddings import compute_similarity
import logging

logger = logging.getLogger(__name__)

def match_scorer_node(state: AgentState):
    """Scores jobs using sentence-transformer cosine similarity against the user's resume/preferences."""
    jobs = state.get("filtered_jobs", [])
    resume = state.get("resume", "")
    user_prefs = state.get("user_preferences", {})
    
    # Build a profile text from whatever context we have
    profile_text = resume
    if not profile_text:
        # Fallback: use preferences as a rough profile
        roles = user_prefs.get("roles", [])
        keywords = user_prefs.get("keywords", [])
        profile_text = f"Looking for roles: {', '.join(roles)}. Skills: {', '.join(keywords)}."
    
    if not profile_text or not jobs:
        # Can't score without context, return jobs with default score
        for job in jobs:
            job["match_score"] = 50
        return {"scored_jobs": jobs}
    
    scored_jobs = []
    for job in jobs:
        # Build a text representation of the job
        job_text = f"{job.get('title', '')} at {job.get('company', '')}. {job.get('description', '')} Location: {job.get('location', '')}"
        
        try:
            score = compute_similarity(profile_text, job_text)
            job["match_score"] = int(score)
        except Exception as e:
            logger.warning(f"Scoring failed for job '{job.get('title')}': {e}")
            job["match_score"] = 50
        
        scored_jobs.append(job)
    
    return {"scored_jobs": sorted(scored_jobs, key=lambda x: x["match_score"], reverse=True)}

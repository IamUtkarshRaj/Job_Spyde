from agents.state import AgentState
import logging

logger = logging.getLogger(__name__)

def filter_jobs_node(state: AgentState):
    """
    Pre-filters raw jobs using deterministic rules BEFORE sending to the LLM scorer.
    This saves massive compute by dropping clearly irrelevant jobs early.
    """
    user_prefs = state.get("user_preferences", {})
    raw_jobs = state.get("raw_jobs", [])
    
    target_location = user_prefs.get("location", "").lower()
    keywords = [k.lower() for k in user_prefs.get("keywords", [])]
    roles = [r.lower() for r in user_prefs.get("roles", [])]
    
    filtered = []
    for job in raw_jobs:
        title = job.get("title", "").lower()
        loc = job.get("location", "").lower()
        desc = job.get("description", "").lower()
        searchable_text = f"{title} {desc}"
        
        # ── Location filter ──
        if target_location and target_location not in loc:
            if loc not in ["remote", "unknown", "", "anywhere"]:
                continue
        
        # ── Keyword relevance boost (soft filter) ──
        # If user specified keywords, at least one must appear in title or description
        if keywords:
            has_keyword = any(kw in searchable_text for kw in keywords)
            if not has_keyword:
                # Check if the role itself matches
                has_role = any(r in title for r in roles)
                if not has_role:
                    continue
        
        filtered.append(job)
    
    # Cap at 15 jobs max to keep scoring fast on CPU
    filtered = filtered[:15]
    
    logger.info(f"Pre-filter: {len(raw_jobs)} raw → {len(filtered)} filtered jobs")
    return {"filtered_jobs": filtered}

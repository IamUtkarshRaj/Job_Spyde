from typing import List
from app.agents.llm import get_embeddings
from app.database import supabase

async def embed_text(text: str) -> List[float]:
    """Generates an embedding for the given text using Gemini."""
    embeddings = get_embeddings()
    # aembed_query returns List[float]
    return await embeddings.aembed_query(text)

async def upsert_job_embedding(job_id: str, embedding: List[float]):
    """Upserts a job embedding into Supabase pgvector table."""
    try:
        data, count = supabase.table('job_embeddings').upsert({
            'job_id': job_id,
            'embedding': embedding
        }).execute()
        return data
    except Exception as e:
        print(f"Failed to upsert embedding for {job_id}: {e}")
        return None

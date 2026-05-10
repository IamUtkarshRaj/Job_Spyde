import os
import asyncio
from supabase import create_client, Client

def get_supabase_client() -> Client:
    url = os.environ.get("SUPABASE_URL") or os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
    # For a trusted backend worker traversing RLS, we ideally use the service_role_key.
    key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY") or os.environ.get("NEXT_PUBLIC_SUPABASE_ANON_KEY")
    if not url or not key:
        raise ValueError("Supabase URL and Key must be provided")
    return create_client(url, key)

supabase = get_supabase_client()

async def get_profile(user_id: str):
    def _fetch():
        res = supabase.table("profiles").select("*").eq("id", user_id).execute()
        return res.data[0] if res.data else None
    return await asyncio.to_thread(_fetch)

async def upsert_jobs(jobs: list[dict]):
    def _upsert():
        res = supabase.table("jobs").upsert(jobs).execute()
        return res.data
    return await asyncio.to_thread(_upsert)

async def update_agent_run(run_id: str, data: dict):
    def _update():
        res = supabase.table("agent_runs").update(data).eq("id", run_id).execute()
        return res.data
    return await asyncio.to_thread(_update)

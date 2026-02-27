import logging
from supabase import create_client, Client
from app.config import get_settings

logger = logging.getLogger(__name__)

# We use the sync client here as the supabase-py async client has some limitations,
# or we can write custom async wrappers around httpx if needed.
# For simplicity and given the python supabase library design, we'll expose a wrapper.
# Actually, supabase-py now has an async client via `from supabase_lib.client import create_client as ...`
# Let's just use the standard sync client for data operations as it's most stable, 
# or if we need pure async we can use postgrest-py directly.
# Let's stick to the official `supabase.create_client`.

def get_supabase_client() -> Client:
    settings = get_settings()
    if not settings.NEXT_PUBLIC_SUPABASE_URL or not settings.NEXT_PUBLIC_SUPABASE_ANON_KEY:
         logger.warning("Supabase credentials not found in environment.")
    return create_client(
        settings.NEXT_PUBLIC_SUPABASE_URL,
        settings.NEXT_PUBLIC_SUPABASE_ANON_KEY
    )

supabase: Client = get_supabase_client()

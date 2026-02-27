from fastapi import APIRouter
from app.redis_client import redis_client

router = APIRouter()

@router.get("/")
def health_check():
    return {"status": "ok"}

@router.get("/ready")
async def readiness_check():
    try:
        await redis_client.ping()
        redis_status = "ok"
    except Exception as e:
        redis_status = f"failed: {str(e)}"

    return {
        "status": "ready" if redis_status == "ok" else "error",
        "redis": redis_status,
        # supabase client doesn't have a simple async ping, so we skip it for basic readiness
    }

import redis.asyncio as redis
from app.config import get_settings

def get_redis_client() -> redis.Redis:
    settings = get_settings()
    
    # Create redis connection
    return redis.Redis(
        host=settings.REDIS_HOST,
        port=settings.REDIS_PORT,
        password=settings.REDIS_PASSWORD,
        decode_responses=True,
        ssl=True if "cloud.redislabs.com" in settings.REDIS_HOST else False
    )

redis_client = get_redis_client()

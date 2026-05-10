import os
from redis.asyncio import Redis

def _get_redis_url():
    url = os.environ.get("REDIS_URL")
    if url:
        return url
    
    host = os.environ.get("REDIS_HOST", "localhost")
    port = os.environ.get("REDIS_PORT", "6379")
    password = os.environ.get("REDIS_PASSWORD", "")
    use_ssl = os.environ.get("REDIS_USE_SSL", "false").lower() == "true"
    
    protocol = "rediss" if use_ssl else "redis"
    
    if password:
        return f"{protocol}://default:{password}@{host}:{port}"
    return f"{protocol}://{host}:{port}"

# Connection arguments
redis_kwargs = {
    "decode_responses": True,
    "socket_timeout": 5.0,
}

redis_client = Redis.from_url(_get_redis_url(), **redis_kwargs)

async def rate_limit_check(user_id: str, limit: int = 5, window: int = 3600) -> bool:
    """Check if the user is within the rate limit."""
    key = f"rate_limit:{user_id}"
    current = await redis_client.get(key)
    if current and int(current) >= limit:
        return False
    
    pipe = redis_client.pipeline()
    pipe.incr(key)
    if not current:
        pipe.expire(key, window)
    await pipe.execute()
    return True

async def enqueue_task(task_id: str, data: dict):
    """Enqueue a background task (metadata wrapper)"""
    import json
    await redis_client.hset(f"task:{task_id}", mapping={"data": json.dumps(data), "status": "pending"})

async def get_task_status(task_id: str):
    """Retrieve task metadata from Redis (complementary to Supabase)"""
    return await redis_client.hgetall(f"task:{task_id}")

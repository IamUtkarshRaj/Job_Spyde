import asyncio
import os
from dotenv import load_dotenv

# Load env before importing services.redis
load_dotenv()

async def test_import():
    try:
        from services.redis import redis_client
        print(f"Redis client initialized with URL ending in: {redis_client.connection_pool.connection_kwargs}")
        await redis_client.ping()
        print("Redis Ping Successful!")
    except Exception as e:
        print(f"Redis Test Failed: {e}")

if __name__ == "__main__":
    asyncio.run(test_import())

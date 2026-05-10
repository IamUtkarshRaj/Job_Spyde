import asyncio
import os
from dotenv import load_dotenv
from redis.asyncio import Redis

load_dotenv()

async def test_redis():
    host = os.environ.get("REDIS_HOST")
    port = os.environ.get("REDIS_PORT")
    password = os.environ.get("REDIS_PASSWORD")
    
    # Try with rediss://
    url = f"rediss://default:{password}@{host}:{port}"
    print(f"Testing connection to {url}")
    
    client = Redis.from_url(url, decode_responses=True)
    try:
        await client.ping()
        print("Success!")
    except Exception as e:
        print(f"Failed with rediss://: {e}")
        
    # Try with redis://
    url2 = f"redis://default:{password}@{host}:{port}"
    print(f"Testing connection to {url2}")
    client2 = Redis.from_url(url2, decode_responses=True)
    try:
        await client2.ping()
        print("Success!")
    except Exception as e:
        print(f"Failed with redis://: {e}")

if __name__ == "__main__":
    asyncio.run(test_redis())

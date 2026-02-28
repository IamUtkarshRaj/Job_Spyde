import httpx
import asyncio

async def main():
    payload = {
        "user_id": "00000000-0000-0000-0000-000000000000",
        "roles": ["Software Engineer"],
        "locations": ["Remote"],
        "remote": True,
        "keywords": ["Python", "React"]
    }
    async with httpx.AsyncClient() as client:
        print("Sending request to collect jobs...")
        try:
            res = await client.post("http://127.0.0.1:8000/v1/jobs/collect", json=payload, timeout=120.0)
            print("Status:", res.status_code)
            jobs = res.json()
            print(f"Found {len(jobs)} jobs")
            for job in jobs[:3]:
                print(f"- {job['title']} @ {job['company']} (Score: {job.get('match_score')})")
        except Exception as e:
            print("Request failed:", e)

asyncio.run(main())

import asyncio
from app.collectors.jobspy_collector import JobSpyCollector
from app.models.job import JobFilter

async def main():
    col = JobSpyCollector()
    query = JobFilter(roles=[], locations=[])
    res = await col.collect(query)
    print("Found", len(res), "jobs with empty query.")

asyncio.run(main())

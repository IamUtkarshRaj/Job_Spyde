import asyncio
from app.collectors.greenhouse import GreenhouseCollector
from app.collectors.lever import LeverCollector
from app.collectors.ashby import AshbyCollector
from app.collectors.jobspy_collector import JobSpyCollector
from app.models.job import JobFilter

async def main():
    query = JobFilter(roles=["software engineer"], locations=["remote"])
    
    print("Testing JobSpyCollector")
    try:
        res = await JobSpyCollector().collect(query)
        print("JobSpy Results:", len(res))
        if res:
            print("First Job:", res[0].model_dump())
    except Exception as e:
        print("JobSpy Error:", e)

    companies = ["vimeo", "figma", "notion", "stripe", "plaid"]
    
    print("Testing GreenhouseCollector")
    try:
        res = await GreenhouseCollector(companies).collect(query)
        print("Greenhouse Results:", len(res))
    except Exception as e:
        print("Greenhouse Error:", e)

    print("Testing LeverCollector")
    try:
        res = await LeverCollector(companies).collect(query)
        print("Lever Results:", len(res))
    except Exception as e:
        print("Lever Error:", e)

    print("Testing AshbyCollector")
    try:
        res = await AshbyCollector(companies).collect(query)
        print("Ashby Results:", len(res))
    except Exception as e:
        print("Ashby Error:", e)

if __name__ == "__main__":
    asyncio.run(main())

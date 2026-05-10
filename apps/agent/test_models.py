import asyncio
import sys

if sys.platform == "win32":
    asyncio.set_event_loop_policy(asyncio.WindowsProactorEventLoopPolicy())

async def test_scrapers():
    print("Testing scrapers sequentially to avoid loop collisions...")
    from scrapers.linkedin import LinkedInScraper
    from scrapers.internshala import InternshalaScraper
    from services.embeddings import compute_similarity

    # 1. Test LinkedIn
    print("\n--- LinkedIn Scraper ---")
    linkedin = LinkedInScraper()
    try:
        jobs_in = await linkedin.scrape("Software Engineer", "Remote", limit=2)
        print(f"LinkedIn returned {len(jobs_in)} jobs.")
        for j in jobs_in:
            print(f"  {j['title']} @ {j['company']} - {j['location']}")
    except Exception as e:
        print(f"LinkedIn Error: {e}")

    # 2. Test Internshala
    print("\n--- Internshala Scraper ---")
    internshala = InternshalaScraper()
    try:
        jobs_int = await internshala.scrape("Software Engineer", "", limit=2)
        print(f"Internshala returned {len(jobs_int)} jobs.")
        for j in jobs_int:
            print(f"  {j['title']} @ {j['company']} - {j['location']}")
    except Exception as e:
        print(f"Internshala Error: {e}")

    # 3. Test Embedded matching
    print("\n--- Testing Embedded Model ---")
    resume_context = "I am a frontend developer with 3 years of React experience and Python."
    job_desc = "We need a Senior Software Engineer with deep React and Django/Python experience. Remote OK."
    try:
        score = compute_similarity(resume_context, job_desc)
        print(f"Match Score for Resume vs Job: {score}%")
    except Exception as e:
        print(f"Model Error: {e}")

if __name__ == "__main__":
    asyncio.run(test_scrapers())

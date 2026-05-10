import asyncio
import logging
from scrapers.linkedin import LinkedInScraper
from scrapers.naukri import NaukriScraper
from scrapers.internshala import InternshalaScraper
from scrapers.glassdoor import GlassdoorScraper

logging.basicConfig(level=logging.INFO)

async def test_all():
    query = "software engineer"
    location = "bangalore"
    limit = 2
    
    print("\n--- Testing LinkedIn ---")
    linkedin = LinkedInScraper()
    print(await linkedin.scrape(query, location, limit))
    
    print("\n--- Testing Naukri ---")
    naukri = NaukriScraper()
    print(await naukri.scrape(query, location, limit))

    print("\n--- Testing Internshala ---")
    intern = InternshalaScraper()
    print(await intern.scrape(query, location, limit))
    
    print("\n--- Testing Glassdoor ---")
    glassdoor = GlassdoorScraper()
    print(await glassdoor.scrape(query, location, limit))

if __name__ == "__main__":
    asyncio.run(test_all())

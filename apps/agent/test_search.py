import os
import requests
from bs4 import BeautifulSoup
from duckduckgo_search import DDGS
from dotenv import load_dotenv

load_dotenv()

def test_search_and_scrape():
    # 1. Test Search
    print("\n--- Testing Search ---")
    try:
        results = DDGS().text("site:linkedin.com/jobs OR site:indeed.com/jobs software engineer intern remote", max_results=5)
        print("Search successful!")
        print(f"Results preview: {results[:2]}...")
    except Exception as e:
        print(f"Search failed: {e}")
        return

    # 2. Test Scrape (using a known safe URL like example.com or python.org)
    print("\n--- Testing Scraper ---")
    url = "https://www.python.org/"
    try:
        response = requests.get(url, timeout=5)
        response.raise_for_status()
        soup = BeautifulSoup(response.text, 'html.parser')
        text = soup.title.string
        print(f"Scrape successful! Title: {text}")
    except Exception as e:
        print(f"Scrape failed: {e}")

if __name__ == "__main__":
    test_search_and_scrape()

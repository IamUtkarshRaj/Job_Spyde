from playwright.sync_api import sync_playwright
from playwright_stealth import Stealth

def test_naukri():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        Stealth().apply_stealth_sync(page)
        page.goto("https://www.naukri.com/software-engineer-jobs-in-india", wait_until="networkidle")
        page.wait_for_timeout(5000)
        print("Page title:", page.title())
        with open("naukri.html", "w", encoding="utf-8") as f:
            f.write(page.content())
        browser.close()

test_naukri()

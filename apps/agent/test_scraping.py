from playwright.sync_api import sync_playwright
from playwright_stealth import Stealth

def test_linkedin():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        Stealth().apply_stealth_sync(page)
        page.goto("https://www.linkedin.com/jobs/search?keywords=software+engineer&location=India")
        page.wait_for_timeout(3000)
        jobs = page.query_selector_all("ul.jobs-search__results-list > li")
        print("LinkedIn Jobs:", len(jobs))
        for j in jobs[:2]:
            t = j.query_selector(".base-search-card__title")
            print("Title:", t.inner_text().strip() if t else "N/A")
            c = j.query_selector(".base-search-card__subtitle")
            print("Company:", c.inner_text().strip() if c else "N/A")
            u = j.query_selector("a.base-card__full-link")
            print("URL:", u.get_attribute("href") if u else "N/A")
        browser.close()

def test_internshala():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        Stealth().apply_stealth_sync(page)
        page.goto("https://internshala.com/jobs/developer-jobs-in-india/")
        page.wait_for_timeout(3000)
        jobs = page.query_selector_all(".individual_internship")
        print("Internshala Jobs:", len(jobs))
        for j in jobs[:2]:
            t = j.query_selector(".title a, .job-title-href")
            print("Title:", t.inner_text().strip() if t else "N/A")
            c = j.query_selector(".company_name")
            print("Company:", c.inner_text().strip() if c else "N/A")
            l = j.query_selector(".locations, .location_link")
            print("Location:", l.inner_text().strip() if l else "N/A")
        browser.close()

def test_naukri():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        Stealth().apply_stealth_sync(page)
        page.goto("https://www.naukri.com/software-engineer-jobs-in-india")
        page.wait_for_timeout(3000)
        jobs = page.query_selector_all(".srp-jobtuple-wrapper")
        print("Naukri Jobs:", len(jobs))
        for j in jobs[:2]:
            t = j.query_selector(".title")
            print("Title:", t.inner_text().strip() if t else "N/A")
            c = j.query_selector(".comp-name")
            print("Company:", c.inner_text().strip() if c else "N/A")
        browser.close()

test_linkedin()
test_internshala()
test_naukri()

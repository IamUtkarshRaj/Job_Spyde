"""Quick test for the /v1/jobs/collect endpoint."""
import requests
import json

payload = {
    "user_id": "test-user",
    "roles": ["Software Engineer"],
    "locations": ["Remote"],
    "keywords": ["python", "react"],
    "years_of_experience": "2"
}

print("Testing /v1/jobs/collect ...")
r = requests.post("http://127.0.0.1:8000/v1/jobs/collect", json=payload)
print(f"Status: {r.status_code}")

if r.status_code == 200:
    data = r.json()
    if isinstance(data, list):
        print(f"\nFound {len(data)} jobs:\n")
        for job in data:
            title = job.get("title", "?")
            company = job.get("company", "?")
            score = job.get("match_score", "N/A")
            source = job.get("source", "?")
            print(f"  [{score}%] {title} @ {company} ({source})")
    else:
        print("Response:", json.dumps(data, indent=2))
else:
    print("Error:", r.text)

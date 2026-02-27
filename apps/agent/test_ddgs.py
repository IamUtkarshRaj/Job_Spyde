from duckduckgo_search import DDGS
import json

def test():
    results = DDGS().text("software engineer remote jobs", max_results=5)
    print(json.dumps(list(results)))

if __name__ == "__main__":
    test()

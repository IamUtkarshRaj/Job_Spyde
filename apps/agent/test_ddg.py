import urllib.request
import urllib.parse
import re

def test_ddg():
    query = "(site:boards.greenhouse.io OR site:jobs.lever.co) Software Engineer remote"
    url = f"https://html.duckduckgo.com/html/?q={urllib.parse.quote_plus(query)}"
    
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"})
    try:
        with urllib.request.urlopen(req) as response:
            html = response.read().decode('utf-8')
            
            # The structure is:
            # <div class="result results_links_deep highlight_d result--url-above-snippet">
            #   <h2 class="result__title">
            #       <a class="result__url" href="...">TITLE</a>
            #   </h2>
            #   <a class="result__snippet" href="...">SNIPPET</a>
            # </div>
            
            results = re.findall(r'<h2 class="result__title">.*?<a class="result__url"[^>]*href="([^"]+)"[^>]*>(.*?)</a>.*?</h2>.*?<a class="result__snippet[^"]*"[^>]*>(.*?)</a>', html, re.DOTALL | re.IGNORECASE)
            print("Regex results found:", len(results))
            for href, title, snippet in results[:5]:
                # clean tags from title and snippet
                title = re.sub(r'<[^>]+>', '', title).strip()
                snippet = re.sub(r'<[^>]+>', '', snippet).strip()
                
                # unescape html entities if needed (optional)
                
                if "uddg=" in href:
                    try:
                        parsed_url = urllib.parse.urlparse(href)
                        params = urllib.parse.parse_qs(parsed_url.query)
                        if 'uddg' in params:
                            href = urllib.parse.unquote(params['uddg'][0])
                    except:
                        pass
                
                print("---")
                print("Title:", title)
                print("URL:", href)
                print("Snippet:", snippet)
                
    except Exception as e:
        print("Error:", e)

if __name__ == "__main__":
    test_ddg()

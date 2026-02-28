const apikey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhxYXJtdWVwaXp5enllcGpuZHRnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEwNzg2NTYsImV4cCI6MjA4NjY1NDY1Nn0.6qpzDtODtBikMwQbaCaEVEgSbCveWGGpC8GfOXF1FVU";
const url = "https://xqarmuepizyzyepjndtg.supabase.co/rest/v1/profiles?select=*";

fetch(url, {
    headers: {
        "apikey": apikey,
        "Authorization": "Bearer " + apikey
    }
}).then(r => r.json()).then(data => console.log(JSON.stringify(data, null, 2))).catch(e => console.error(e));

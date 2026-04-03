const apikey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhxYXJtdWVwaXp5enllcGpuZHRnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEwNzg2NTYsImV4cCI6MjA4NjY1NDY1Nn0.6qpzDtODtBikMwQbaCaEVEgSbCveWGGpC8GfOXF1FVU";
const url = "https://xqarmuepizyzyepjndtg.supabase.co/rest/v1/jobs?select=*&limit=1";

fetch(url, {
    headers: {
        "apikey": apikey,
        "Authorization": "Bearer " + apikey
    }
}).then(r => r.json()).then(data => {
    if (data.length > 0) {
        console.log("Columns:", Object.keys(data[0]));
    } else {
        console.log("No data found in jobs table to inspect columns.");
        // Try to get schema via OPTIONS if enabled, or just try a dummy insert to see error
    }
}).catch(e => console.error(e));

const apikey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhxYXJtdWVwaXp5enllcGpuZHRnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEwNzg2NTYsImV4cCI6MjA4NjY1NDY1Nn0.6qpzDtODtBikMwQbaCaEVEgSbCveWGGpC8GfOXF1FVU";
const url = "https://xqarmuepizyzyepjndtg.supabase.co/rest/v1/jobs";

// Try to insert a job with only the minimum fields I think are required
const dummyJob = {
    user_id: "00000000-0000-0000-0000-000000000000", // Needs a real UUID in a real test but this might fail with RLS or FK
    title: "Test Job",
    company: "Test Company"
};

fetch(url, {
    method: "POST",
    headers: {
        "apikey": apikey,
        "Authorization": "Bearer " + apikey,
        "Content-Type": "application/json",
        "Prefer": "return=minimal"
    },
    body: JSON.stringify(dummyJob)
}).then(async r => {
    if (!r.ok) {
        const errorText = await r.text();
        console.log("Insert Error:", errorText);
    } else {
        console.log("Insert Success! (Surprisingly)");
    }
}).catch(e => console.error(e));

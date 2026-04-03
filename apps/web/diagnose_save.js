const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Manually parse .env.local
const envPath = path.resolve(__dirname, '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const [key, value] = line.split('=');
  if (key && value) {
    env[key.trim()] = value.trim();
  }
});

const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function testSave() {
  const dummyJob = {
    title: "Diagnostic Test Job",
    company: "Test Corp",
    location: "Remote",
    source: "Test",
    url: "https://example.com/test-" + Date.now(),
    description: "Testing schema mismatch",
    status: "saved",
    user_id: "00000000-0000-0000-0000-000000000000" // This might fail RLS but I want to see the error code
  };

  console.log("Attempting insert with fields:", Object.keys(dummyJob));
  
  const { data, error } = await supabase.from('jobs').insert([dummyJob]).select();

  if (error) {
    console.error("INSERT ERROR:", JSON.stringify(error, null, 2));
  } else {
    console.log("INSERT SUCCESS:", data);
  }
}

testSave();

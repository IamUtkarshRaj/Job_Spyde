from app.database import supabase

try:
    print("Testing 'profiles' table...")
    res = supabase.table("profiles").select("*").limit(1).execute()
    print("Profiles table exists! Result:", res.data)
except Exception as e:
    print("Error accessing 'profiles':", e)

try:
    print("Testing 'resumes' table...")
    res = supabase.table("resumes").select("*").limit(1).execute()
    print("Resumes table exists! Result:", res.data)
except Exception as e:
    print("Error accessing 'resumes':", e)

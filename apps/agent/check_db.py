from app.database import supabase
import sys

def check():
    res = supabase.table('profiles').select('*').limit(1).execute()
    if res.data:
        print("FIRST USER PROFILE ROW:")
        print(res.data[0])
    else:
        print("No users found.")

if __name__ == "__main__":
    check()

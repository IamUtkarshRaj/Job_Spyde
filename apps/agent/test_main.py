import sys
try:
    import app.main
    print("app.main imported successfully!")
except Exception as e:
    import traceback
    traceback.print_exc()

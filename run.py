import os
import sys
import webbrowser
import threading
import time
import uvicorn

def open_browser():
    time.sleep(1.2)
    print("\n=======================================================")
    print(" VISIONFORGE - MINE AR")
    print(" Vocational Safety Training Simulator for Coal Mines")
    print(" Compliant with DGMS & CMR 2017 (Dhanbad, Jharia, Bokaro)")
    print(" Running at: http://127.0.0.1:8000")
    print("=======================================================\n")
    try:
        webbrowser.open("http://127.0.0.1:8000")
    except Exception as e:
        print(f"Could not open browser automatically: {e}")

if __name__ == "__main__":
    # Ensure current directory is on python path
    curr_dir = os.path.dirname(os.path.abspath(__file__))
    if curr_dir not in sys.path:
        sys.path.insert(0, curr_dir)

    # Launch browser thread
    threading.Thread(target=open_browser, daemon=True).start()

    # Run FastAPI via Uvicorn
    uvicorn.run("backend.server:app", host="0.0.0.0", port=8000, reload=False)

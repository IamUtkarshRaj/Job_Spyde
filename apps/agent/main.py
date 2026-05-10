import sys
import os
import asyncio
from dotenv import load_dotenv

load_dotenv()  # Extremely important to load .env so Redis correctly maps to Redislabs!

if sys.platform == "win32":
    asyncio.set_event_loop_policy(asyncio.WindowsProactorEventLoopPolicy())

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import health, agents, feedback, resume, jobs

app = FastAPI(
    title="Job Spyde Agent Service",
    description="Multi-agent service for job discovery, matching, and resume tailoring.",
    version="1.0.0",
)

# Setup CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API Routers
app.include_router(health.router)
app.include_router(agents.router)
app.include_router(feedback.router)
app.include_router(resume.router)
app.include_router(jobs.router)

if __name__ == "__main__":
    import uvicorn
    # Passing the raw `app` object instead of a string prevents Uvicorn from spawning 
    # child processes for hot-reloading, guaranteeing the Proactor Event Loop remains intact!
    uvicorn.run(app, host="127.0.0.1", port=8000)

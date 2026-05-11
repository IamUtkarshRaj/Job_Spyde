import sys
import os
import asyncio
import logging
from pathlib import Path
from dotenv import load_dotenv

# Load .env from project root (../../.env relative to apps/agent/)
# In Docker, env vars are injected by compose — dotenv is a local dev fallback.
_root_env = Path(__file__).resolve().parent.parent.parent / ".env"
_local_env = Path(__file__).resolve().parent / ".env"

if _root_env.exists():
    load_dotenv(_root_env)
elif _local_env.exists():
    load_dotenv(_local_env)
else:
    load_dotenv()  # fallback: search default locations

# Configure structured logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger("jobspyde")

if sys.platform == "win32":
    asyncio.set_event_loop_policy(asyncio.WindowsProactorEventLoopPolicy())

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import health, agents, feedback, resume, jobs

app = FastAPI(
    title="Job Spyde Agent Service",
    description="Multi-agent service for job discovery, matching, and resume tailoring.",
    version="1.0.0",
    docs_url="/docs" if os.environ.get("ENVIRONMENT") != "production" else None,
    redoc_url=None,
)

# Dynamic CORS — reads comma-separated origins from CORS_ORIGINS env var
allowed_origins = os.environ.get(
    "CORS_ORIGINS", "http://localhost:3000"
).split(",")
allowed_origins = [origin.strip() for origin in allowed_origins if origin.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
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


@app.on_event("startup")
async def startup_event():
    logger.info("JobSpyde Agent Service starting up...")
    logger.info(f"CORS origins: {allowed_origins}")
    logger.info(f"Environment: {os.environ.get('ENVIRONMENT', 'development')}")


@app.on_event("shutdown")
async def shutdown_event():
    logger.info("JobSpyde Agent Service shutting down...")


if __name__ == "__main__":
    import uvicorn
    # Passing the raw `app` object instead of a string prevents Uvicorn from spawning 
    # child processes for hot-reloading, guaranteeing the Proactor Event Loop remains intact!
    uvicorn.run(app, host="127.0.0.1", port=8000)

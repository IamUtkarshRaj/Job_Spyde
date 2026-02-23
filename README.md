# Student Job Application & Tracking MVP

A monorepo containing a Next.js web application and a Python agent service for tracking job applications and tailoring resumes.

## Architecture

- **Frontend**: Next.js 14+ (App Router), Tailwind CSS (`apps/web`)
- **Agent Service**: FastAPI, LangGraph (`apps/agent`)
- **Database**: Supabase (Auth, Postgres, Storage)
- **Infrastructure**: Docker Compose (for agent service)

## Prerequisites

- Node.js 18+
- Python 3.11+
- Docker & Docker Compose
- Supabase Project (Free Tier)

## Setup Instructions

### 1. Supabase Setup

1.  Create a new project on [Supabase](https://supabase.com/).
2.  Go to the SQL Editor and run the contents of `supabase/schema.sql`.
3.  Go to Storage, create a public bucket named `resumes`.
4.  Get your `SUPABASE_URL` and `SUPABASE_ANON_KEY` from Project Settings > API.

### 2. Environment Variables

**Frontend (`apps/web/.env.local`)**:
```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

**Agent Service (`apps/agent/.env`)**:
Copy `apps/agent/.env.example` to `apps/agent/.env` and fill in API keys:
```bash
OPENAI_API_KEY=sk-... (optional, for LLM features)
GOOGLE_API_KEY=AIza... (optional, fallback)
```

### 3. Running the Project

**Agent Service**:
```bash
cd apps/agent
# Option A: Docker
docker-compose up --build

# Option B: Local Python
pip install -r requirements.txt
uvicorn main:app --reload
```

**Frontend**:
```bash
cd apps/web
npm install
npm run dev
```

The web app will be available at `http://localhost:3000` and the agent service at `http://localhost:8000`.

## Features

- **Auth**: Sign up/Login via Supabase.
- **Onboarding**: Set job preferences.
- **Dashboard**: Track job statuses (Discovered, Applied, etc.).
- **Resume Tailoring**: Generate custom resume drafts for specific jobs.
- **Digest**: View daily summary of job activities.

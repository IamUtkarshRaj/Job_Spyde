# JobSpyde — AI-Powered Job Discovery & Tracking Platform

A monorepo containing a Next.js web application and a Python agent service for intelligent job discovery, matching, resume tailoring, and application tracking.

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                   AWS EC2 Instance                   │
│  ┌───────────────────────────────────────────────┐  │
│  │            Nginx (Reverse Proxy)               │  │
│  │         :80 / :443 (SSL termination)           │  │
│  └──────────────┬───────────────┬────────────────┘  │
│                 │               │                    │
│        /        │     /api/agent│                    │
│                 │               │                    │
│  ┌──────────────▼─┐  ┌────────▼──────────────┐    │
│  │  Next.js Web   │  │  FastAPI Agent         │    │
│  │  :3000 (int)   │  │  :8000 (int)           │    │
│  └────────────────┘  └──────────┬────────────┘    │
│                                  │                  │
│  ┌────────────────┐             │                  │
│  │  Redis :6379   │◄────────────┘                  │
│  └────────────────┘                                │
└─────────────────────────────────────────────────────┘
         │                    │
    ┌────▼────┐         ┌────▼─────┐
    │Supabase │         │RedisLabs │
    │(DB/Auth)│         │ (Cloud)  │
    └─────────┘         └──────────┘
```

- **Frontend**: Next.js 16 (App Router), Tailwind CSS v4 (`apps/web`)
- **Agent Service**: FastAPI, LangGraph, Playwright (`apps/agent`)
- **Database**: Supabase (Auth, Postgres, Storage)
- **Cache**: RedisLabs Cloud (ap-south-1)
- **Infrastructure**: Docker Compose, Nginx, GitHub Actions CI/CD

## Project Structure

```
├── .github/workflows/     # CI/CD pipelines
│   ├── ci.yml             # Lint, build, test on every push
│   └── deploy.yml         # Build → GHCR → EC2 deploy on main
├── infra/
│   ├── nginx/             # Nginx reverse proxy config
│   │   ├── nginx.conf
│   │   └── conf.d/
│   │       ├── default.conf         # HTTP config (active)
│   │       └── ssl.conf.template    # HTTPS template (for domain)
│   └── scripts/
│       ├── ec2-setup.sh   # One-time EC2 bootstrap
│       ├── ssl-init.sh    # SSL certificate setup
│       └── ssl-renew.sh   # Certificate renewal cron
├── apps/
│   ├── web/               # Next.js frontend
│   └── agent/             # FastAPI + LangGraph agent
├── docker-compose.yml          # Development
├── docker-compose.prod.yml     # Production
├── Makefile                    # Developer shortcuts
└── .env.example                # Environment template
```

## Prerequisites

- Node.js 20+
- Python 3.11+
- Docker & Docker Compose v2
- Supabase Project
- AWS Account (for production)

---

## Quick Start (Local Development)

### 1. Clone & Setup

```bash
git clone https://github.com/IamUtkarshRaj/Job_Spyde.git
cd Job_Spyde
cp .env.example .env
# Fill in your API keys in .env
```

### 2. Environment Variables

**Frontend** (`apps/web/.env.local`):
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_AGENT_URL=http://127.0.0.1:8000
```

**Agent** (`apps/agent/.env`):
```env
GOOGLE_API_KEY=your-gemini-key
REDIS_HOST=redis-host
REDIS_PORT=6379
REDIS_PASSWORD=your-redis-password
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Run Locally

**With Docker Compose** (recommended):
```bash
docker compose up --build
```

**Without Docker**:
```bash
# Terminal 1: Agent
cd apps/agent
pip install -r requirements.txt
uvicorn main:app --reload

# Terminal 2: Web
cd apps/web
npm install
npm run dev
```

The web app runs at `http://localhost:3000` and the agent at `http://localhost:8000`.

---

## Production Deployment (AWS EC2)

### 1. Launch EC2 Instance

- **AMI**: Ubuntu 22.04 LTS
- **Instance type**: `t3.medium` (2 vCPU, 4GB RAM)
- **Region**: `ap-south-1` (Mumbai)
- **Storage**: 30GB gp3
- **Security Group**:
  - Inbound: SSH (22), HTTP (80), HTTPS (443)
  - Outbound: All traffic

### 2. Bootstrap EC2

```bash
# Upload and run setup script
scp infra/scripts/ec2-setup.sh ubuntu@<EC2-IP>:~/
ssh ubuntu@<EC2-IP> "chmod +x ~/ec2-setup.sh && sudo ~/ec2-setup.sh"
```

### 3. Initial Deploy

```bash
ssh ubuntu@<EC2-IP>
cd /opt/jobspyde
git clone https://github.com/IamUtkarshRaj/Job_Spyde.git .
cp .env.example .env
nano .env  # Fill in production values
docker compose -f docker-compose.prod.yml up -d --build
```

### 4. Setup GitHub Actions (automated deploys)

Add these secrets to your GitHub repo (`Settings → Secrets → Actions`):

| Secret | Value |
|--------|-------|
| `EC2_HOST` | Your EC2 public IP |
| `EC2_USER` | `ubuntu` |
| `EC2_SSH_KEY` | Contents of your `.pem` private key |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key |
| `GOOGLE_API_KEY` | Gemini API key |
| `REDIS_HOST` | RedisLabs host |
| `REDIS_PORT` | RedisLabs port |
| `REDIS_PASSWORD` | RedisLabs password |

After setup, every push to `main` triggers: **CI → Build → Push to GHCR → Deploy to EC2**.

### 5. SSL Setup (when you have a domain)

```bash
# Point your domain's DNS A record to EC2 IP, then:
ssh ubuntu@<EC2-IP>
cd /opt/jobspyde
./infra/scripts/ssl-init.sh yourdomain.com your@email.com

# Add auto-renewal cron:
(crontab -l; echo "0 3 * * * /opt/jobspyde/infra/scripts/ssl-renew.sh") | crontab -
```

---

## Makefile Commands

```bash
make dev          # Start dev environment
make prod         # Start production locally
make build        # Build all Docker images
make health       # Check service health
make logs         # Tail production logs
make status       # Show running containers
make clean        # Remove all Docker artifacts
```

---

## Features

- **Auth**: Sign up / Login via Supabase
- **Onboarding**: Set job preferences (role, location, experience)
- **Dashboard**: Kanban-style job tracking (Discovered → Applied → Interview → Offer)
- **Job Discovery**: AI-powered job scraping from Naukri, LinkedIn, Internshala, Glassdoor
- **Resume Optimizer**: AI-driven resume extraction, parsing, and tailoring
- **Analytics**: Job search insights and activity tracking
- **Digest**: Daily summary of job activities

---

## CI/CD Pipeline

```
Push to main → CI (lint + build + docker check) → Deploy (build images → push to GHCR → SSH to EC2 → pull + restart)
```

- **CI** runs on every push/PR
- **Deploy** runs only on pushes to `main`, after CI passes
- Images are tagged with both `latest` and the commit SHA
- Docker layer caching via GitHub Actions Cache

---

## License

Private — All rights reserved.

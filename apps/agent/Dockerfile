# ==========================================
# Agent Service — Production Dockerfile
# ==========================================
# Multi-stage build with non-root user, health checks, and optimized layers.

# --- Base image with system dependencies ---
FROM python:3.11-slim AS base

WORKDIR /app

# Install system dependencies for Playwright and building Python packages
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    wget \
    curl \
    gnupg \
    libnss3 \
    libatk1.0-0 \
    libatk-bridge2.0-0 \
    libcups2 \
    libdrm2 \
    libxkbcommon0 \
    libxcomposite1 \
    libxdamage1 \
    libxrandr2 \
    libgbm1 \
    libpango-1.0-0 \
    libcairo2 \
    libasound2 \
    libxshmfence1 \
    libxfixes3 \
    libxcb1 \
    libx11-xcb1 \
    && rm -rf /var/lib/apt/lists/*

# Create non-root user
RUN groupadd --system --gid 1001 appgroup && \
    useradd --system --uid 1001 --gid appgroup appuser

# --- Dependencies layer (cached separately) ---
FROM base AS dependencies

WORKDIR /app

COPY requirements.txt .

# Install Python dependencies with a high timeout and cache mount to prevent network dropouts
RUN --mount=type=cache,target=/root/.cache/pip \
    pip install --default-timeout=1000 -r requirements.txt

# Install Playwright browser binaries with extended timeout and retry loop
ENV PLAYWRIGHT_DOWNLOAD_CONNECTION_TIMEOUT=120000
RUN for i in 1 2 3 4 5 6 7 8 9 10; do \
      python -m playwright install chromium && break || \
      if [ $i -eq 10 ]; then exit 1; fi; \
      echo "Playwright install failed (attempt $i). Retrying in 5 seconds..."; \
      sleep 5; \
    done

# --- Production image ---
FROM base AS production

WORKDIR /app

# Copy installed Python packages from dependencies stage
COPY --from=dependencies /usr/local/lib/python3.11/site-packages /usr/local/lib/python3.11/site-packages
COPY --from=dependencies /usr/local/bin /usr/local/bin

# Copy Playwright browsers (installed by root in dependencies stage)
COPY --from=dependencies /root/.cache/ms-playwright /home/appuser/.cache/ms-playwright
RUN chown -R appuser:appgroup /home/appuser/.cache

# Copy application code
COPY . .

# Set ownership
RUN chown -R appuser:appgroup /app

# Environment
ENV PYTHONPATH=/app
ENV PLAYWRIGHT_HEADLESS=true
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

EXPOSE 8000

# Health check — agent exposes /health endpoint
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

# Run as non-root user
USER appuser

# Start with multiple workers for production
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "2", "--access-log"]

# ==========================================
# JobSpyde — Makefile
# ==========================================
# Developer shortcuts for common operations.

.PHONY: help dev dev-down prod prod-down build deploy logs health clean

# Default target
help: ## Show this help
	@echo "JobSpyde - Available Commands:"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2}'

# ---- Development ----
dev: ## Start development environment (docker compose)
	docker compose up --build

dev-down: ## Stop development environment
	docker compose down

dev-logs: ## Tail development logs
	docker compose logs -f

# ---- Production (local testing) ----
prod: ## Start production stack locally
	docker compose -f docker-compose.prod.yml up --build -d

prod-down: ## Stop production stack
	docker compose -f docker-compose.prod.yml down

prod-logs: ## Tail production logs
	docker compose -f docker-compose.prod.yml logs -f

prod-restart: ## Restart production stack
	docker compose -f docker-compose.prod.yml restart

# ---- Build ----
build-web: ## Build web Docker image
	docker build -t jobspyde-web ./apps/web

build-agent: ## Build agent Docker image
	docker build -t jobspyde-agent ./apps/agent

build: build-web build-agent ## Build all Docker images

# ---- Health ----
health: ## Check service health
	@echo "--- Nginx ---"
	@curl -sf http://localhost/ > /dev/null && echo "✓ OK" || echo "✗ DOWN"
	@echo "--- Agent ---"
	@curl -sf http://localhost/api/agent/health && echo "" || echo "✗ DOWN"

# ---- Utilities ----
clean: ## Remove all Docker artifacts (containers, images, volumes)
	docker compose -f docker-compose.prod.yml down -v --rmi all
	docker system prune -af

status: ## Show running containers
	docker compose -f docker-compose.prod.yml ps

shell-web: ## Open shell in web container
	docker compose -f docker-compose.prod.yml exec web sh

shell-agent: ## Open shell in agent container
	docker compose -f docker-compose.prod.yml exec agent bash

# ---- SSL ----
ssl-init: ## Initialize SSL certificates (requires domain)
	@read -p "Domain: " domain; \
	read -p "Email: " email; \
	./infra/scripts/ssl-init.sh $$domain $$email

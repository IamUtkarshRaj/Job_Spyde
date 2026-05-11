#!/bin/bash
# ==========================================
# JobSpyde — SSL Certificate Auto-Renewal
# ==========================================
# Add to crontab:
#   0 3 * * * /opt/jobspyde/infra/scripts/ssl-renew.sh >> /var/log/certbot-renew.log 2>&1

set -euo pipefail

APP_DIR="/opt/jobspyde"

echo "[$(date)] Starting SSL certificate renewal check..."

# Renew certificates (only renews if within 30 days of expiry)
certbot renew --quiet

# Reload Nginx to pick up new certificates
cd "$APP_DIR"
docker compose -f docker-compose.prod.yml exec -T nginx nginx -s reload

echo "[$(date)] SSL renewal check complete."

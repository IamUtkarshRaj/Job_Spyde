#!/bin/bash
# ==========================================
# JobSpyde — SSL Certificate Initialization
# ==========================================
# Run this ONCE when you have a domain name pointing to your EC2 IP.
#
# Usage: ./infra/scripts/ssl-init.sh yourdomain.com your@email.com
#
# Prerequisites:
#   - Domain DNS A record pointing to EC2 public IP
#   - Nginx running (HTTP mode) via docker-compose.prod.yml
#   - Certbot installed (done by ec2-setup.sh)

set -euo pipefail

DOMAIN="${1:?Usage: $0 <domain> <email>}"
EMAIL="${2:?Usage: $0 <domain> <email>}"
APP_DIR="/opt/jobspyde"

echo "=========================================="
echo "  SSL Setup for: $DOMAIN"
echo "=========================================="

# ---- 1. Ensure Nginx is running in HTTP mode ----
echo "[1/4] Verifying Nginx is running..."
cd "$APP_DIR"
docker compose -f docker-compose.prod.yml up -d nginx
sleep 5

# ---- 2. Obtain SSL certificate ----
echo "[2/4] Requesting SSL certificate from Let's Encrypt..."

# Create webroot directory (mounted as volume in docker-compose)
WEBROOT_DIR="$APP_DIR/certbot-webroot"
mkdir -p "$WEBROOT_DIR"

certbot certonly \
    --webroot \
    --webroot-path "$WEBROOT_DIR" \
    --email "$EMAIL" \
    --agree-tos \
    --no-eff-email \
    --force-renewal \
    -d "$DOMAIN"

echo "  ✓ SSL certificate obtained"

# ---- 3. Switch Nginx to SSL config ----
echo "[3/4] Activating SSL configuration..."

# Backup current HTTP config
cp "$APP_DIR/infra/nginx/conf.d/default.conf" "$APP_DIR/infra/nginx/conf.d/default.conf.http-backup"

# Copy SSL template and replace domain
sed "s/YOUR_DOMAIN/$DOMAIN/g" "$APP_DIR/infra/nginx/conf.d/ssl.conf.template" > "$APP_DIR/infra/nginx/conf.d/default.conf"

echo "  ✓ SSL config activated"

# ---- 4. Update docker-compose to mount cert volumes properly ----
echo "[4/4] Restarting Nginx with SSL..."

# Update certbot volumes in docker-compose to use host paths
docker compose -f docker-compose.prod.yml restart nginx

echo ""
echo "=========================================="
echo "  ✅ SSL Setup Complete!"
echo "=========================================="
echo ""
echo "  Your site is now available at: https://$DOMAIN"
echo ""
echo "  Auto-renewal cron (add to crontab):"
echo "  0 3 * * * /opt/jobspyde/infra/scripts/ssl-renew.sh >> /var/log/certbot-renew.log 2>&1"
echo ""

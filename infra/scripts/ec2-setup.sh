#!/bin/bash
# ==========================================
# JobSpyde — EC2 Instance Bootstrap Script
# ==========================================
# Run this ONCE on a fresh Ubuntu 22.04 EC2 instance.
#
# Usage (from your local machine):
#   scp infra/scripts/ec2-setup.sh ubuntu@<EC2-IP>:~/
#   ssh ubuntu@<EC2-IP> "chmod +x ~/ec2-setup.sh && sudo ~/ec2-setup.sh"
#
# Prerequisites:
#   - EC2 instance: t3.medium, Ubuntu 22.04 LTS, ap-south-1
#   - Security Group: inbound rules for 22 (SSH), 80 (HTTP), 443 (HTTPS)
#   - Your SSH key pair attached to the instance

set -euo pipefail

echo "=========================================="
echo "  JobSpyde EC2 Setup — Starting..."
echo "=========================================="

# ---- 1. System Update ----
echo "[1/8] Updating system packages..."
apt-get update -y
apt-get upgrade -y
apt-get install -y \
    apt-transport-https \
    ca-certificates \
    curl \
    gnupg \
    lsb-release \
    software-properties-common \
    git \
    htop \
    unzip \
    fail2ban

# ---- 2. Install Docker Engine ----
echo "[2/8] Installing Docker Engine..."
if ! command -v docker &> /dev/null; then
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null
    apt-get update -y
    apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
    systemctl enable docker
    systemctl start docker
    echo "  ✓ Docker installed: $(docker --version)"
else
    echo "  ✓ Docker already installed: $(docker --version)"
fi

# ---- 3. Create Deploy User ----
echo "[3/8] Configuring deploy user..."
usermod -aG docker ubuntu
# Allow ubuntu user to run docker without sudo
newgrp docker || true

# ---- 4. Install Certbot ----
echo "[4/8] Installing Certbot..."
if ! command -v certbot &> /dev/null; then
    apt-get install -y certbot
    echo "  ✓ Certbot installed: $(certbot --version)"
else
    echo "  ✓ Certbot already installed: $(certbot --version)"
fi

# ---- 5. Create Application Directory ----
echo "[5/8] Setting up application directory..."
APP_DIR="/opt/jobspyde"
mkdir -p "$APP_DIR"
chown ubuntu:ubuntu "$APP_DIR"
echo "  ✓ App directory: $APP_DIR"

# ---- 6. Configure Firewall (UFW) ----
echo "[6/8] Configuring firewall..."
ufw --force reset
ufw default deny incoming
ufw default allow outgoing
ufw allow 22/tcp    # SSH
ufw allow 80/tcp    # HTTP
ufw allow 443/tcp   # HTTPS
ufw --force enable
echo "  ✓ Firewall configured (SSH, HTTP, HTTPS)"

# ---- 7. Configure Docker Log Rotation ----
echo "[7/8] Setting up Docker log rotation..."
cat > /etc/docker/daemon.json <<EOF
{
    "log-driver": "json-file",
    "log-opts": {
        "max-size": "10m",
        "max-file": "3"
    },
    "storage-driver": "overlay2"
}
EOF
systemctl restart docker
echo "  ✓ Docker log rotation configured"

# ---- 8. Create Systemd Service ----
echo "[8/8] Creating systemd service for auto-restart..."
cat > /etc/systemd/system/jobspyde.service <<EOF
[Unit]
Description=JobSpyde Application (Docker Compose)
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
User=ubuntu
WorkingDirectory=/opt/jobspyde
ExecStart=/usr/bin/docker compose -f docker-compose.prod.yml up -d
ExecStop=/usr/bin/docker compose -f docker-compose.prod.yml down
TimeoutStartSec=300

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable jobspyde.service
echo "  ✓ Systemd service created (auto-starts on boot)"

# ---- Setup Swap (helps with PyTorch on low-memory instances) ----
echo "[BONUS] Setting up 2GB swap..."
if [ ! -f /swapfile ]; then
    fallocate -l 2G /swapfile
    chmod 600 /swapfile
    mkswap /swapfile
    swapon /swapfile
    echo "/swapfile swap swap defaults 0 0" >> /etc/fstab
    echo "  ✓ 2GB swap created"
else
    echo "  ✓ Swap already exists"
fi

# ---- Configure fail2ban ----
echo "[BONUS] Configuring fail2ban..."
systemctl enable fail2ban
systemctl start fail2ban
echo "  ✓ fail2ban enabled"

echo ""
echo "=========================================="
echo "  ✅ EC2 Setup Complete!"
echo "=========================================="
echo ""
echo "Next steps:"
echo "  1. Log out and log back in (for Docker group to take effect)"
echo "  2. Clone your repo:  cd /opt/jobspyde && git clone https://github.com/IamUtkarshRaj/Job_Spyde.git ."
echo "  3. Create .env:      cp .env.example .env && nano .env"
echo "  4. Deploy:           docker compose -f docker-compose.prod.yml up -d --build"
echo "  5. Check:            docker compose -f docker-compose.prod.yml ps"
echo ""
echo "For SSL (when you have a domain):"
echo "  ./infra/scripts/ssl-init.sh YOUR_DOMAIN your@email.com"
echo ""

#!/bin/bash
# ==============================================================================
# Automated VPS Deployment Script for vibeshillong.com
# Ubuntu / Debian 20.04 / 22.04 LTS
# ==============================================================================

set -e

echo "🚀 [1/6] Updating system packages..."
sudo apt update && sudo apt upgrade -y

echo "📦 [2/6] Installing Node.js 20.x, Git, Nginx, and Certbot..."
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs git nginx certbot python3-certbot-nginx

echo "⚙️ [3/6] Installing PM2 Process Manager globally..."
sudo npm install -g pm2

echo "📂 [4/6] Setting up project directory at /var/www/vibe-shillong..."
sudo mkdir -p /var/www/vibe-shillong
sudo chown -R $USER:$USER /var/www/vibe-shillong

if [ ! -d "/var/www/vibe-shillong/.git" ]; then
    git clone https://github.com/DigitalSuccessSolution/vibe-shillong.git /var/www/vibe-shillong
fi

cd /var/www/vibe-shillong
git pull origin main

echo "🏗️ [5/6] Building Frontend..."
npm install
npm run build

echo "🔧 [6/6] Installing Backend Dependencies..."
cd /var/www/vibe-shillong/server
npm install

echo "✅ Base setup complete!"
echo ""
echo "👉 NEXT STEPS:"
echo "1. Create /var/www/vibe-shillong/server/.env with your secrets:"
echo "   nano /var/www/vibe-shillong/server/.env"
echo ""
echo "2. Start Backend with PM2:"
echo "   pm2 start server.js --name 'vibe-backend'"
echo "   pm2 save && pm2 startup"
echo ""
echo "3. Copy Nginx Configuration:"
echo "   sudo cp /var/www/vibe-shillong/nginx-vibeshillong.conf /etc/nginx/sites-available/vibeshillong.com"
echo "   sudo ln -s /etc/nginx/sites-available/vibeshillong.com /etc/nginx/sites-enabled/"
echo "   sudo nginx -t && sudo systemctl restart nginx"
echo ""
echo "4. Obtain Free SSL (HTTPS):"
echo "   sudo certbot --nginx -d vibeshillong.com -d www.vibeshillong.com"
echo ""

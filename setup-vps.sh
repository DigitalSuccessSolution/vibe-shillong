#!/bin/bash
# ==============================================================================
# Safe Multi-Project VPS Deployment Script for vibeshillong.com
# Safely co-exists with other websites and PM2 apps on the same VPS!
# ==============================================================================

set -e

APP_DIR="/var/www/vibeshillong"

echo "📂 [1/4] Preparing isolated folder at $APP_DIR..."
sudo mkdir -p $APP_DIR
sudo chown -R $USER:$USER $APP_DIR

if [ ! -d "$APP_DIR/.git" ]; then
    echo "Cloning repository..."
    git clone https://github.com/DigitalSuccessSolution/vibe-shillong.git $APP_DIR
else
    echo "Updating existing repository..."
    cd $APP_DIR && git pull origin main
fi

cd $APP_DIR

echo "🏗️ [2/4] Building Frontend..."
npm install
npm run build

echo "🔧 [3/4] Installing Backend Dependencies..."
cd $APP_DIR/server
npm install

echo "✅ Code ready in $APP_DIR!"
echo ""
echo "👉 NEXT STEPS FOR MULTI-PROJECT VPS:"
echo "1. Check if port 5005 is free (or choose another port):"
echo "   sudo lsof -i :5005 || sudo netstat -tuln | grep 5005"
echo ""
echo "2. Create server/.env file:"
echo "   nano $APP_DIR/server/.env"
echo "   (Make sure PORT=5005)"
echo ""
echo "3. Start Backend in PM2 without disturbing other apps:"
echo "   cd $APP_DIR/server"
echo "   pm2 start server.js --name 'vibeshillong-backend'"
echo "   pm2 save"
echo ""
echo "4. Add independent Nginx config (Does NOT touch other sites):"
echo "   sudo cp $APP_DIR/nginx-vibeshillong.conf /etc/nginx/sites-available/vibeshillong.com"
echo "   sudo ln -sf /etc/nginx/sites-available/vibeshillong.com /etc/nginx/sites-enabled/"
echo "   sudo nginx -t && sudo systemctl reload nginx"
echo ""
echo "5. Issue SSL for vibeshillong.com only:"
echo "   sudo certbot --nginx -d vibeshillong.com -d www.vibeshillong.com"

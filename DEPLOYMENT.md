# Deployment Guide

This guide will help you deploy the Cinema Connection Game to Netlify (frontend) and a VPS (backend).

## Prerequisites

- Node.js 18+ installed
- A TMDB API key (free at https://www.themoviedb.org/settings/api)
- Netlify account
- VPS with Ubuntu/Debian (for WebSocket server)
- Domain name (optional but recommended)

## Part 1: Deploy Frontend to Netlify

### Step 1: Prepare the Repository

1. **Add your files to Git:**
   ```bash
   git add .
   git commit -m "Initial commit - ready for deployment"
   ```

2. **Create a GitHub repository** (or GitLab/Bitbucket)
   ```bash
   git remote add origin https://github.com/yourusername/your-repo.git
   git push -u origin main
   ```

### Step 2: Deploy to Netlify

1. **Go to Netlify** (https://app.netlify.com)
2. Click "Add new site" → "Import an existing project"
3. Connect your Git provider and select your repository
4. **Build settings:**
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Click "Deploy site"

### Step 3: Configure Environment Variables on Netlify

1. Go to **Site settings** → **Environment variables**
2. Add these variables:

   ```
   VITE_TMDB_API_KEY = your_tmdb_api_key_here
   VITE_WS_SERVER_URL = wss://your-domain.com  (see Part 2)
   VITE_SNAPSHOT_SERVER_URL = https://your-domain.com/api/snapshots
   ```

3. **Redeploy** your site for the changes to take effect

## Part 2: Deploy Backend to VPS

### Step 1: Set Up Your VPS

1. **Connect to your VPS:**
   ```bash
   ssh user@your-vps-ip
   ```

2. **Install Node.js:**
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```

3. **Install PM2 (process manager):**
   ```bash
   sudo npm install -g pm2
   ```

4. **Install Nginx:**
   ```bash
   sudo apt update
   sudo apt install nginx
   ```

### Step 2: Upload Server Files

1. **Create a directory for your app:**
   ```bash
   mkdir -p ~/cinema-connection-server
   cd ~/cinema-connection-server
   ```

2. **Upload server files** (using scp from your local machine):
   ```bash
   scp -r server/* user@your-vps-ip:~/cinema-connection-server/
   ```

3. **Install dependencies:**
   ```bash
   cd ~/cinema-connection-server
   npm install
   ```

### Step 3: Start the Server with PM2

```bash
# Start game server
pm2 start game-server.js --name "game-server"

# Start snapshot server
pm2 start snapshot-server.js --name "snapshot-server"

# Save PM2 configuration
pm2 save

# Set PM2 to start on system boot
pm2 startup
# Follow the instructions it provides
```

### Step 4: Configure Nginx as Reverse Proxy

1. **Create Nginx configuration:**
   ```bash
   sudo nano /etc/nginx/sites-available/cinema-connection
   ```

2. **Add this configuration:**
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;  # Replace with your domain

       # Redirect HTTP to HTTPS (after SSL is set up)
       return 301 https://$server_name$request_uri;
   }

   server {
       listen 443 ssl http2;
       server_name your-domain.com;  # Replace with your domain

       # SSL certificates (set up with Certbot - see below)
       ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
       ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

       # WebSocket endpoint
       location /ws/ {
           proxy_pass http://localhost:3011;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection "upgrade";
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
           proxy_read_timeout 86400;
       }

       # API endpoints
       location /api/ {
           proxy_pass http://localhost:3011;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
       }
   }
   ```

3. **Enable the site:**
   ```bash
   sudo ln -s /etc/nginx/sites-available/cinema-connection /etc/nginx/sites-enabled/
   sudo nginx -t  # Test configuration
   sudo systemctl reload nginx
   ```

### Step 5: Set Up SSL with Let's Encrypt

1. **Install Certbot:**
   ```bash
   sudo apt install certbot python3-certbot-nginx
   ```

2. **Get SSL certificate:**
   ```bash
   sudo certbot --nginx -d your-domain.com
   ```

3. **Set up auto-renewal:**
   ```bash
   sudo certbot renew --dry-run
   ```

### Step 6: Configure Firewall

```bash
sudo ufw allow 'Nginx Full'
sudo ufw allow OpenSSH
sudo ufw enable
```

## Part 3: Update Netlify with Backend URL

1. Go back to **Netlify** → **Site settings** → **Environment variables**
2. Update these variables with your VPS domain:
   ```
   VITE_WS_SERVER_URL = wss://your-domain.com
   VITE_SNAPSHOT_SERVER_URL = https://your-domain.com/api/snapshots
   ```
3. **Trigger a redeploy** in Netlify

## Testing

1. **Open your Netlify site** in a browser
2. **Start a multiplayer game**
3. **Scan the QR code** with your phone
4. **Verify the connection works**

## Monitoring

### Check Server Logs

```bash
# View game server logs
pm2 logs game-server

# View snapshot server logs
pm2 logs snapshot-server

# View all logs
pm2 logs

# Monitor server status
pm2 status
```

### Restart Servers

```bash
# Restart a specific server
pm2 restart game-server

# Restart all servers
pm2 restart all
```

## Troubleshooting

### WebSocket Connection Fails

1. **Check Nginx logs:**
   ```bash
   sudo tail -f /var/log/nginx/error.log
   ```

2. **Verify the game server is running:**
   ```bash
   pm2 status
   ```

3. **Check firewall:**
   ```bash
   sudo ufw status
   ```

### SSL Issues

1. **Verify SSL certificates:**
   ```bash
   sudo certbot certificates
   ```

2. **Renew certificates manually:**
   ```bash
   sudo certbot renew
   ```

### CORS Errors

- Make sure `VITE_WS_SERVER_URL` in Netlify matches your domain exactly
- Check that Nginx is properly proxying requests

## Updating the App

### Frontend (Netlify)

1. Push changes to Git:
   ```bash
   git add .
   git commit -m "Update description"
   git push
   ```
2. Netlify will auto-deploy

### Backend (VPS)

1. Upload new server files:
   ```bash
   scp -r server/* user@your-vps-ip:~/cinema-connection-server/
   ```

2. Restart servers:
   ```bash
   pm2 restart all
   ```

## Cost Estimate

- **Netlify**: Free tier (includes 100GB bandwidth/month)
- **VPS**: $5-10/month (Digital Ocean, Linode, Vultr)
- **Domain**: $10-15/year
- **SSL**: Free (Let's Encrypt)

**Total**: ~$5-10/month + domain

## Next Steps

1. Set up monitoring (e.g., UptimeRobot)
2. Configure backups for your VPS
3. Set up a staging environment
4. Add analytics (optional)

## Support

For issues, check:
- Server logs: `pm2 logs`
- Nginx logs: `/var/log/nginx/`
- Browser console for frontend errors


# Doctor Tracker API - Ubuntu VPS Deployment Guide

## Prerequisites on VPS
- Ubuntu 20.04+ or 22.04+
- SSH access with sudo privileges

## Step 1: Install Dependencies

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install git
sudo apt install -y git

# Install PM2
sudo npm install -g pm2

# Install Nginx
sudo apt install -y nginx

# Install Certbot for SSL
sudo apt install -y certbot python3-certbot-nginx
```

## Step 2: Clone Repository

```bash
cd /var/www
sudo git clone <YOUR_REPO_URL> doctor-tracker-server
cd doctor-tracker-server
```

## Step 3: Install Dependencies and Build

```bash
# Install dependencies
npm ci

# Create .env file
nano .env
# Add your production environment variables (see .env.example)

# Build the project
npm run build
```

## Step 4: Start with PM2

```bash
# Start the application
pm2 start ecosystem.config.cjs

# Save PM2 process list
pm2 save

# Setup PM2 to start on system boot
pm2 startup
# Follow the instructions to execute the generated command
```

## Step 5: Configure Nginx

```bash
# Copy nginx config
sudo cp deploy/nginx.conf.example /etc/nginx/sites-available/doctor-tracker-api

# Edit the config (replace YOURDOMAIN.com)
sudo nano /etc/nginx/sites-available/doctor-tracker-api

# Enable the site
sudo ln -s /etc/nginx/sites-available/doctor-tracker-api /etc/nginx/sites-enabled/

# Test nginx config
sudo nginx -t

# Restart nginx
sudo systemctl restart nginx
```

## Step 6: Setup SSL with Certbot

```bash
# Obtain SSL certificate
sudo certbot --nginx -d api.YOURDOMAIN.com

# Certbot will automatically configure SSL and redirect HTTP to HTTPS
```

## Step 7: MongoDB Atlas Setup

1. Go to MongoDB Atlas dashboard
2. Go to Network Access
3. Add IP address: `<YOUR_VPS_PUBLIC_IP>`
4. Save the whitelist

## Step 8: Verify Deployment

```bash
# Check PM2 status
pm2 status

# Check logs
pm2 logs doctor-tracker-api

# Test health endpoint
curl https://api.YOURDOMAIN.com/api/health
```

## Update Deployment

When you push new code:

```bash
cd /var/www/doctor-tracker-server
sudo git pull
npm ci
npm run build
pm2 restart doctor-tracker-api
```

## Environment Variables Required

Copy from `.env.example` and fill in:
- `PORT` (default: 5000)
- `NODE_ENV` (set to `production`)
- `MONGODB_URI` (MongoDB Atlas connection string)
- `JWT_SECRET` (generate a long random string)
- `JWT_EXPIRES_IN` (default: 7d)
- `CLIENT_URL` (your frontend URL)
- `ADMIN_EMAIL` (admin email)
- `ADMIN_PASSWORD` (strong password)

## Troubleshooting

```bash
# Check PM2 logs
pm2 logs doctor-tracker-api

# Restart app
pm2 restart doctor-tracker-api

# Check Nginx logs
sudo tail -f /var/log/nginx/error.log

# Check if app is running
pm2 status
```

# Manual Hosting Guide for AI Agent Application

This guide covers various methods to manually host your AI Agent application from GitHub, ranging from simple static hosting to full-featured server deployments.

## 🚀 Quick Start - Choose Your Hosting Method

| Method | Difficulty | Cost | Best For |
|--------|-------------|-------|-----------|
| [Vercel](#vercel-hosting) | ⭐ Easy | Free | Next.js apps, quick deployment |
| [Netlify](#netlify-hosting) | ⭐ Easy | Free | Static sites, simple setup |
| [GitHub Pages](#github-pages-hosting) | ⭐ Easy | Free | Documentation, static hosting |
| [Railway](#railway-hosting) | ⭐⭐ Medium | $5+/mo | Full-stack apps, databases |
| [Render](#render-hosting) | ⭐⭐ Medium | Free/$7+/mo | Docker, background jobs |
| [DigitalOcean](#digitalocean-hosting) | ⭐⭐⭐ Hard | $4+/mo | Full control, custom setup |
| [AWS](#aws-hosting) | ⭐⭐⭐⭐ Hard | Free tier | Enterprise, scalable |

---

## 1. Vercel Hosting (Recommended for Next.js)

### 🎯 Why Vercel?
- ✅ Built for Next.js applications
- ✅ Automatic deployments from GitHub
- ✅ Serverless functions included
- ✅ Free tier with generous limits
- ✅ Custom domains support
- ✅ Edge caching globally

### 📋 Prerequisites
- GitHub repository (✅ Already done)
- Vercel account (free)

### 🚀 Setup Steps

#### Step 1: Create Vercel Account
1. Go to [vercel.com](https://vercel.com)
2. Click "Sign Up"
3. Choose "Continue with GitHub"
4. Authorize Vercel to access your repositories

#### Step 2: Import Project
1. Click "Add New..." → "Project"
2. Find `agented` in your GitHub repositories
3. Click "Import"

#### Step 3: Configure Project
```json
{
  "name": "agented",
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/next"
    }
  ],
  "env": {
    "DATABASE_URL": "@database_url",
    "OLLAMA_URL": "@ollama_url",
    "ZAI_API_KEY": "@zai_api_key"
  }
}
```

#### Step 4: Add Environment Variables
In Vercel dashboard → Settings → Environment Variables:
```
DATABASE_URL = file:./dev.db
NODE_ENV = production
NEXT_PUBLIC_APP_URL = https://your-app.vercel.app
```

#### Step 5: Deploy
1. Click "Deploy"
2. Wait for build to complete
3. Your app is live at `https://agented.vercel.app`

### 🔧 Vercel Configuration Files

Create `vercel.json` in your project root:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/next"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/api/$1"
    },
    {
      "src": "/(.*)",
      "dest": "/$1"
    }
  ],
  "env": {
    "NEXT_PUBLIC_VERCEL": "true"
  },
  "functions": {
    "app/api/**/*.ts": {
      "maxDuration": 30
    }
  }
}
```

### 📱 Deploying to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy from local
vercel --prod

# Link existing project
vercel link
vercel --prod
```

---

## 2. Netlify Hosting

### 🎯 Why Netlify?
- ✅ Excellent for static sites
- ✅ Forms and functions support
- ✅ Free SSL certificates
- ✅ Git-based deployments
- ✅ Split testing support

### 🚀 Setup Steps

#### Step 1: Create Netlify Account
1. Go to [netlify.com](https://netlify.com)
2. Sign up with GitHub
3. Authorize access

#### Step 2: Create New Site
1. Click "New site from Git"
2. Choose GitHub
3. Select `agented` repository

#### Step 3: Configure Build Settings
```
Build command: bun run build
Publish directory: out
Node version: 18
```

#### Step 4: Environment Variables
```
NODE_ENV=production
DATABASE_URL=file:./dev.db
```

#### Step 5: Deploy Site
1. Click "Deploy site"
2. Wait for build
3. Site is live at random-name.netlify.app

### 🔧 Netlify Configuration

Create `netlify.toml`:

```toml
[build]
  command = "bun run build"
  publish = "out"
  node_version = "18"

[build.environment]
  NODE_ENV = "production"

[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/:splat"
  status = 200

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-XSS-Protection = "1; mode=block"
    X-Content-Type-Options = "nosniff"

[functions]
  directory = "netlify/functions"
```

---

## 3. GitHub Pages Hosting

### 🎯 Why GitHub Pages?
- ✅ Completely free
- ✅ Integrated with GitHub
- ✅ Jekyll support
- ✅ Custom domains
- ✅ HTTPS automatically

### 🚀 Setup Steps

#### Step 1: Configure GitHub Pages
1. Go to your repository on GitHub
2. Click **Settings** → **Pages**
3. Source: Deploy from a branch
4. Branch: `main`
5. Folder: `/root`
6. Click **Save**

#### Step 2: Configure for Static Export
Update `next.config.ts`:

```typescript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  assetPrefix: '/agented',
  basePath: '/agented'
}

module.exports = nextConfig
```

#### Step 3: Update package.json
```json
{
  "scripts": {
    "build": "next build && next export",
    "deploy": "gh-pages -d out"
  }
}
```

#### Step 4: Deploy to GitHub Pages
```bash
# Install gh-pages
npm install -D gh-pages

# Build and deploy
npm run build
npm run deploy
```

### 🔧 GitHub Pages Configuration

Create `.github/workflows/deploy-pages.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
        
    - name: Install dependencies
      run: bun install
      
    - name: Build
      run: bun run build
      
    - name: Deploy to GitHub Pages
      uses: peaceiris/actions-gh-pages@v3
      with:
        github_token: ${{ secrets.GITHUB_TOKEN }}
        publish_dir: ./out
```

---

## 4. Railway Hosting

### 🎯 Why Railway?
- ✅ Full-stack hosting
- ✅ Database included
- ✅ Docker support
- ✅ Environment variables
- ✅ Preview deployments

### 🚀 Setup Steps

#### Step 1: Create Railway Account
1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub
3. Authorize access

#### Step 2: Create New Project
1. Click "New Project"
2. Click "Deploy from GitHub repo"
3. Select `agented` repository

#### Step 3: Configure Service
```bash
# Railway automatically detects Next.js
# Add these environment variables in Railway dashboard:
NODE_ENV=production
DATABASE_URL=postgresql://user:pass@host:port/db
PORT=3000
```

#### Step 4: Deploy
1. Railway builds and deploys automatically
2. Get your Railway URL
3. Add custom domain if needed

### 🔧 Railway Configuration

Create `railway.toml`:

```toml
[build]
  builder = "nixpacks"

[deploy]
  healthcheckPath = "/api/health"
  healthcheckTimeout = 300
  restartPolicyType = "on_failure"
  restartPolicyMaxRetries = 10

[[services]]
  name = "web"

  [services.variables]
    NODE_ENV = "production"
    PORT = "3000"
```

---

## 5. Render Hosting

### 🎯 Why Render?
- ✅ Free tier available
- ✅ Docker support
- ✅ Background workers
- ✅ PostgreSQL databases
- ✅ Private services

### 🚀 Setup Steps

#### Step 1: Create Render Account
1. Go to [render.com](https://render.com)
2. Sign up with GitHub
3. Authorize access

#### Step 2: Create New Web Service
1. Click "New +" → "Web Service"
2. Connect GitHub repository
3. Select `agented` repository

#### Step 3: Configure Service
```
Environment: Node
Build Command: bun install && bun run build
Start Command: bun run start
Instance Type: Free
```

#### Step 4: Environment Variables
```
NODE_ENV=production
DATABASE_URL=your_database_url
PORT=3000
```

#### Step 5: Deploy
1. Render builds and deploys automatically
2. Get your Render URL
3. Service is live on `https://your-app.onrender.com`

### 🔧 Render Configuration

Create `render.yaml`:

```yaml
services:
  - type: web
    name: agented
    env: node
    plan: free
    buildCommand: bun install && bun run build
    startCommand: bun run start
    healthCheckPath: /api/health
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 3000
```

---

## 6. DigitalOcean Hosting

### 🎯 Why DigitalOcean?
- ✅ Full server control
- ✅ Affordable pricing
- ✅ Global data centers
- ✅ One-click apps
- ✅ Excellent documentation

### 🚀 Setup Steps

#### Step 1: Create DigitalOcean Account
1. Go to [digitalocean.com](https://digitalocean.com)
2. Create account
3. Add payment method

#### Step 2: Create Droplet
1. Click "Create" → "Droplets"
2. Choose Marketplace → "Node.js on Ubuntu"
3. Select plan (Basic $4/month recommended)
4. Choose data center region
5. Add SSH key
6. Create Droplet

#### Step 3: Configure Server
```bash
# SSH into your droplet
ssh root@your_droplet_ip

# Update system
apt update && apt upgrade -y

# Install Node.js and Bun
curl -fsSL https://bun.sh/install | bash
source ~/.bashrc

# Clone your repository
git clone https://github.com/tiar430/agented.git
cd agented

# Install dependencies
bun install

# Build application
bun run build

# Install PM2 for process management
npm install -g pm2

# Start application with PM2
pm2 start bun --name "agented" -- start
pm2 save
pm2 startup
```

#### Step 4: Configure Nginx
```bash
# Install Nginx
apt install nginx -y

# Create Nginx config
nano /etc/nginx/sites-available/agented
```

Nginx configuration:
```nginx
server {
    listen 80;
    server_name your_domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Enable site
ln -s /etc/nginx/sites-available/agented /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx
```

#### Step 5: Add SSL Certificate
```bash
# Install Certbot
apt install certbot python3-certbot-nginx -y

# Get SSL certificate
certbot --nginx -d your_domain.com
```

---

## 7. AWS Hosting

### 🎯 Why AWS?
- ✅ Enterprise-grade
- ✅ Highly scalable
- ✅ Global infrastructure
- ✅ Free tier available
- ✅ Extensive services

### 🚀 Setup Steps

#### Step 1: Create AWS Account
1. Go to [aws.amazon.com](https://aws.amazon.com)
2. Create account
3. Set up payment method

#### Step 2: Use AWS Amplify (Recommended)
1. Go to AWS Management Console
2. Navigate to Amplify
3. Click "Get Started"
4. Connect GitHub repository
5. Select `agented` repository
6. Configure build settings:
   - Build command: `bun run build`
   - Output directory: `out`
   - Start command: `bun run start`

#### Step 3: Deploy
1. Click "Save and deploy"
2. AWS builds and deploys your app
3. Get your Amplify URL

### 🔧 AWS Amplify Configuration

Create `amplify.yml`:

```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - npm install -g bun
        - bun install
    build:
      commands:
        - bun run build
  artifacts:
    baseDirectory: out
    files:
      - '**/*'
  cache:
    paths:
      - node_modules/**/*
```

---

## 🔧 Configuration for Different Hosts

### Environment Variables

Create `.env.production`:

```env
# Database
DATABASE_URL="file:./dev.db"

# AI Services
OLLAMA_URL="https://your-ollama-instance.com"
ZAI_API_KEY="your-zai-api-key"

# App Configuration
NODE_ENV="production"
NEXT_PUBLIC_APP_URL="https://your-domain.com"
WEBSOCKET_PORT=3001

# Hosting Specific
NEXT_PUBLIC_VERCEL="true"  # For Vercel
NEXT_PUBLIC_NETLIFY="true" # For Netlify
```

### Database Setup

#### For Static Hosts (Vercel, Netlify, GitHub Pages):
```typescript
// lib/db.ts
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL || 'file:./dev.db'
      }
    }
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
```

#### For Server Hosts (Railway, Render, DigitalOcean, AWS):
```bash
# Set up PostgreSQL
sudo apt install postgresql postgresql-contrib -y
sudo -u postgres createdb agented
sudo -u postgres psql -d agented -c "CREATE USER agented_user WITH PASSWORD 'your_password';"
sudo -u postgres psql -d agented -c "GRANT ALL PRIVILEGES ON DATABASE agented TO agented_user;"

# Update DATABASE_URL
DATABASE_URL="postgresql://agented_user:your_password@localhost:5432/agented"
```

---

## 📱 Mobile App Deployment

### APK Distribution

#### Option 1: GitHub Releases
1. Tag your release: `git tag v1.0.0`
2. Push tag: `git push origin v1.0.0`
3. GitHub Actions builds APK automatically
4. Download APK from GitHub Releases

#### Option 2: Direct APK Hosting
```bash
# Upload APK to your hosting
scp agented.apk user@server:/var/www/html/downloads/

# Create download page
echo '<a href="/downloads/agented.apk">Download APK</a>' > /var/www/html/index.html
```

#### Option 3: F-Droid (Open Source)
1. F-Droid requires open source licenses
2. Add metadata and signing keys
3. Submit to F-Droid repository

### Termux Package Distribution

```bash
# Create Termux repository
mkdir -p termux-repo/packages
cp agented-termux.deb termux-repo/packages/

# Create repository index
dpkg-scanpackages termux-repo/packages > termux-repo/Packages
gzip -c termux-repo/Packages > termux-repo/Packages.gz

# Host repository
python3 -m http.server 8080 --directory termux-repo
```

---

## 🚀 Quick Deployment Commands

### Vercel
```bash
npm i -g vercel
vercel login
vercel --prod
```

### Netlify
```bash
npm i -g netlify-cli
netlify login
netlify deploy --prod --dir=out
```

### Railway
```bash
npm i -g @railway/cli
railway login
railway up
```

### Render
```bash
# Connect GitHub repo in Render dashboard
# Automatic deployment on push
```

### DigitalOcean
```bash
# After server setup
git clone https://github.com/tiar430/agented.git
cd agented
bun install
bun run build
pm2 start bun --name agented -- start
```

---

## 🔍 Testing Your Deployment

### Health Check Endpoint
Create `src/app/api/health/route.ts`:

```typescript
export async function GET() {
  return Response.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV
  })
}
```

### Test Commands
```bash
# Test health endpoint
curl https://your-domain.com/api/health

# Test API endpoints
curl https://your-domain.com/api/agents

# Test static assets
curl -I https://your-domain.com/_next/static/css/app/layout.css
```

---

## 📊 Monitoring and Analytics

### Add Analytics
```typescript
// lib/analytics.ts
export const trackEvent = (event: string, data?: any) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', event, data)
  }
}
```

### Error Tracking
```typescript
// lib/error-tracking.ts
export const reportError = (error: Error, context?: any) => {
  console.error('Application Error:', error, context)
  
  // Send to error tracking service
  if (process.env.NODE_ENV === 'production') {
    // Sentry, LogRocket, etc.
  }
}
```

---

## 🛡️ Security Considerations

### HTTPS Setup
All modern hosts provide free SSL certificates. Ensure:
- ✅ HTTPS is enforced
- ✅ HTTP redirects to HTTPS
- ✅ Security headers are set
- ✅ CSP headers are configured

### Environment Variables
- ✅ Never commit secrets to Git
- ✅ Use hosting provider's secret management
- ✅ Rotate API keys regularly
- ✅ Use environment-specific configs

### API Security
```typescript
// lib/security.ts
export const validateRequest = (req: Request) => {
  const origin = req.headers.get('origin')
  const allowedOrigins = [
    'https://your-domain.com',
    'https://your-app.vercel.app'
  ]
  
  return allowedOrigins.includes(origin || '')
}
```

---

## 🎯 Recommended Hosting Choice

### For Beginners: **Vercel**
- Easiest setup
- Built for Next.js
- Free tier
- Automatic deployments

### For Production: **Railway** or **Render**
- Full-stack capabilities
- Database included
- Reasonable pricing
- Good performance

### For Full Control: **DigitalOcean**
- Complete server control
- Best performance
- Custom configurations
- Learning opportunity

### For Enterprise: **AWS**
- Most scalable
- Enterprise features
- Global infrastructure
- Extensive services

---

## 📞 Support

If you encounter issues with hosting:

1. **Check logs**: Look at build and deployment logs
2. **Test locally**: Ensure app works locally first
3. **Check environment**: Verify all environment variables
4. **Review docs**: Check hosting provider documentation
5. **Ask community**: GitHub Issues, Stack Overflow

---

*This guide covers the most common hosting options for your AI Agent application. Choose the one that best fits your needs and budget.*
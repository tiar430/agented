#!/bin/bash

# AI Agent Deployment Script
# This script helps deploy the AI Agent application to various hosting platforms

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check prerequisites
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    # Check Node.js
    if command_exists node; then
        NODE_VERSION=$(node --version)
        print_success "Node.js found: $NODE_VERSION"
    else
        print_error "Node.js not found. Please install Node.js 18+"
        exit 1
    fi
    
    # Check Bun
    if command_exists bun; then
        BUN_VERSION=$(bun --version)
        print_success "Bun found: $BUN_VERSION"
    else
        print_warning "Bun not found. Installing Bun..."
        curl -fsSL https://bun.sh/install | bash
        source ~/.bashrc
    fi
    
    # Check Git
    if command_exists git; then
        print_success "Git found"
    else
        print_error "Git not found. Please install Git"
        exit 1
    fi
    
    print_success "Prerequisites check completed"
}

# Function to build the application
build_app() {
    print_status "Building the application..."
    
    # Install dependencies
    print_status "Installing dependencies..."
    bun install
    
    # Build the application
    print_status "Building Next.js application..."
    bun run build
    
    # Check if build was successful
    if [ -d "out" ] || [ -d ".next" ]; then
        print_success "Application built successfully"
    else
        print_error "Build failed"
        exit 1
    fi
}

# Function to deploy to Vercel
deploy_vercel() {
    print_status "Deploying to Vercel..."
    
    if ! command_exists vercel; then
        print_status "Installing Vercel CLI..."
        npm install -g vercel
    fi
    
    print_status "Login to Vercel (browser will open)..."
    vercel login
    
    print_status "Deploying to Vercel..."
    vercel --prod
    
    print_success "Deployed to Vercel successfully!"
}

# Function to deploy to Netlify
deploy_netlify() {
    print_status "Deploying to Netlify..."
    
    if ! command_exists netlify; then
        print_status "Installing Netlify CLI..."
        npm install -g netlify-cli
    fi
    
    print_status "Login to Netlify (browser will open)..."
    netlify login
    
    print_status "Deploying to Netlify..."
    netlify deploy --prod --dir=out
    
    print_success "Deployed to Netlify successfully!"
}

# Function to deploy to GitHub Pages
deploy_github_pages() {
    print_status "Deploying to GitHub Pages..."
    
    # Check if gh-pages is installed
    if ! npm list gh-pages >/dev/null 2>&1; then
        print_status "Installing gh-pages..."
        npm install --save-dev gh-pages
    fi
    
    # Configure for static export
    print_status "Configuring for static export..."
    
    # Update next.config.ts for static export
    cat > next.config.ts << 'EOF'
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  }
}

module.exports = nextConfig
EOF
    
    # Update package.json
    print_status "Updating package.json for static export..."
    npm pkg set scripts.deploy="gh-pages -d out"
    
    # Build for static export
    print_status "Building for static export..."
    bun run build
    
    # Deploy to GitHub Pages
    print_status "Deploying to GitHub Pages..."
    npm run deploy
    
    print_success "Deployed to GitHub Pages successfully!"
    print_status "Enable GitHub Pages in repository settings"
}

# Function to deploy to Railway
deploy_railway() {
    print_status "Deploying to Railway..."
    
    if ! command_exists railway; then
        print_status "Installing Railway CLI..."
        npm install -g @railway/cli
    fi
    
    print_status "Login to Railway (browser will open)..."
    railway login
    
    print_status "Linking to Railway project..."
    railway link
    
    print_status "Deploying to Railway..."
    railway up
    
    print_success "Deployed to Railway successfully!"
}

# Function to deploy to DigitalOcean
deploy_digitalocean() {
    print_status "Deploying to DigitalOcean..."
    
    echo "This option requires manual setup of a DigitalOcean Droplet"
    echo "Please follow the manual deployment guide in docs/HOSTING_GUIDE.md"
    echo ""
    echo "Quick setup commands for your Droplet:"
    echo "  ssh root@your_droplet_ip"
    echo "  apt update && apt upgrade -y"
    echo "  curl -fsSL https://bun.sh/install | bash"
    echo "  git clone https://github.com/tiar430/agented.git"
    echo "  cd agented"
    echo "  bun install && bun run build"
    echo "  npm install -g pm2"
    echo "  pm2 start bun --name agented -- start"
}

# Function to create environment file
create_env_file() {
    print_status "Creating environment file..."
    
    cat > .env.production << 'EOF'
# Production Environment Variables
NODE_ENV=production

# Database
DATABASE_URL="file:./dev.db"

# AI Services
OLLAMA_URL="https://your-ollama-instance.com"
ZAI_API_KEY="your-zai-api-key"

# App Configuration
NEXT_PUBLIC_APP_URL="https://your-domain.com"
WEBSOCKET_PORT=3001

# Security
JWT_SECRET="your-jwt-secret-here"
ENCRYPTION_KEY="your-encryption-key-here"
EOF
    
    print_warning "Please update .env.production with your actual values"
    print_status "Environment file created: .env.production"
}

# Function to show menu
show_menu() {
    echo ""
    echo "🚀 AI Agent Deployment Script"
    echo "================================"
    echo ""
    echo "Choose your hosting platform:"
    echo ""
    echo "1) Vercel (Recommended for Next.js)"
    echo "2) Netlify (Static sites)"
    echo "3) GitHub Pages (Free static hosting)"
    echo "4) Railway (Full-stack hosting)"
    echo "5) DigitalOcean (VPS hosting)"
    echo "6) Build only (no deployment)"
    echo "7) Create environment file"
    echo "8) Exit"
    echo ""
    echo -n "Enter your choice (1-8): "
}

# Main deployment function
main() {
    echo "🤖 AI Agent Deployment Script"
    echo "============================="
    echo ""
    
    # Check prerequisites
    check_prerequisites
    
    while true; do
        show_menu
        read choice
        
        case $choice in
            1)
                build_app
                deploy_vercel
                break
                ;;
            2)
                build_app
                deploy_netlify
                break
                ;;
            3)
                build_app
                deploy_github_pages
                break
                ;;
            4)
                build_app
                deploy_railway
                break
                ;;
            5)
                deploy_digitalocean
                break
                ;;
            6)
                build_app
                print_success "Build completed. Files are in the 'out' directory."
                break
                ;;
            7)
                create_env_file
                ;;
            8)
                print_status "Exiting..."
                exit 0
                ;;
            *)
                print_error "Invalid choice. Please enter 1-8."
                ;;
        esac
    done
    
    print_success "Deployment process completed!"
    echo ""
    echo "📚 Additional Resources:"
    echo "- Hosting Guide: docs/HOSTING_GUIDE.md"
    echo "- GitHub Actions: docs/GITHUB_ACTIONS.md"
    echo "- API Documentation: docs/API.md"
    echo ""
    echo "🔗 Quick Links:"
    echo "- Vercel: https://vercel.com"
    echo "- Netlify: https://netlify.com"
    echo "- Railway: https://railway.app"
    echo "- DigitalOcean: https://digitalocean.com"
}

# Check if script is being run directly
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi
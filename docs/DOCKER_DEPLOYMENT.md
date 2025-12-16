# Quick Docker Deployment Guide

## 🐳 One-Command Deployment

### Prerequisites
- Docker and Docker Compose installed
- Git

### Quick Start
```bash
# Clone the repository
git clone https://github.com/tiar430/agented.git
cd agented

# Start all services
docker-compose up -d

# Check status
docker-compose ps
```

### What's Included?
- ✅ **AI Agent App** (Next.js on port 3000)
- ✅ **PostgreSQL Database** (on port 5432)
- ✅ **Ollama AI** (on port 11434)
- ✅ **Redis Cache** (on port 6379)
- ✅ **Nginx Proxy** (on port 80)

### Access Your Application
- **Main App**: http://localhost
- **API**: http://localhost/api
- **Database**: localhost:5432
- **Ollama**: http://localhost:11434

### Management Commands
```bash
# View logs
docker-compose logs -f app

# Stop services
docker-compose down

# Update application
git pull
docker-compose up -d --build

# Access database
docker-compose exec db psql -U postgres -d agented

# Backup database
docker-compose exec db pg_dump -U postgres agented > backup.sql
```

### Production Deployment
1. Update `nginx.conf` with your domain
2. Add SSL certificates
3. Set up environment variables
4. Deploy to cloud provider (AWS, DigitalOcean, etc.)

---

*For detailed hosting options, see [HOSTING_GUIDE.md](HOSTING_GUIDE.md)*
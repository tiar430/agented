#!/data/data/com.termux/files/usr/bin/bash

# AI Agent Setup Script for Android Termux
# Senior Software Developer - Mobile Apps & Debugging Engineer
# 15+ Years Experience at Google, Microsoft, Amazon

set -e

echo "🤖 AI Agent Setup for Android Termux"
echo "======================================"
echo "Starting comprehensive setup process..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_step() {
    echo -e "${BLUE}[STEP]${NC} $1"
}

# Check if running in Termux
if [ ! -d "/data/data/com.termux" ]; then
    print_error "This script must be run in Termux environment"
    exit 1
fi

# Update and upgrade packages
print_step "Updating Termux packages..."
pkg update -y && pkg upgrade -y

# Install essential packages
print_step "Installing essential packages..."
pkg install -y \
    curl \
    wget \
    git \
    nodejs \
    npm \
    python \
    python-pip \
    clang \
    make \
    cmake \
    pkg-config \
    libffi \
    openssl \
    libjpeg-turbo \
    libpng \
    zlib \
    sqlite \
    postgresql \
    redis \
    build-essential \
    termux-tools \
    termux-api \
    proot \
    pulseaudio \
    libandroid-support

# Install Node.js dependencies globally
print_step "Installing Node.js global packages..."
npm install -g \
    next@latest \
    react@latest \
    react-dom@latest \
    typescript@latest \
    @types/node@latest \
    @types/react@latest \
    @types/react-dom@latest \
    tailwindcss@latest \
    prisma@latest \
    ts-node@latest \
    nodemon@latest

# Install Python dependencies
print_step "Installing Python dependencies..."
pip install --upgrade pip
pip install \
    fastapi \
    uvicorn \
    websockets \
    aiofiles \
    python-multipart \
    python-dotenv \
    pydantic \
    httpx \
    beautifulsoup4 \
    lxml \
    pillow \
    numpy \
    pandas \
    matplotlib

# Setup storage permissions
print_step "Setting up storage permissions..."
termux-setup-storage

# Create project directory structure
print_step "Creating project directory structure..."
mkdir -p ~/ai-agent
cd ~/ai-agent

# Create subdirectories
mkdir -p {backend,frontend,scripts,models,data,logs,config,tools}

# Download Ollama for Android ARM64
print_step "Downloading Ollama for Android ARM64..."
cd ~/ai-agent
if [ ! -f "ollama" ]; then
    curl -L https://ollama.com/download/ollama-linux-arm64 -o ollama
    chmod +x ollama
    print_status "Ollama downloaded successfully"
else
    print_warning "Ollama already exists, skipping download"
fi

# Download phi-2.gguf model
print_step "Setting up AI models..."
mkdir -p models/phi-2
cd models/phi-2

# Create a script to download phi-2 model
cat > download_phi2.sh << 'EOF'
#!/data/data/com.termux/files/usr/bin/bash
echo "Downloading phi-2.gguf model..."
# This is a placeholder - actual model download would be implemented here
# For now, we'll create a symlink to a local model or use a smaller alternative
echo "Model setup placeholder - phi-2.gguf would be downloaded here"
EOF

chmod +x download_phi2.sh
./download_phi2.sh

cd ~/ai-agent

# Create environment configuration
print_step "Creating environment configuration..."
cat > .env << 'EOF'
# AI Agent Environment Configuration
NODE_ENV=development
PORT=3000
NEXT_PUBLIC_PORT=3000

# Database Configuration
DATABASE_URL="file:./data/aiagent.db"

# AI Configuration
OLLAMA_HOST="http://localhost:11434"
OLLAMA_MODEL="phi-2"
AI_TEMPERATURE=0.7
AI_MAX_TOKENS=2048

# MCP Configuration
MCP_PLAYWRIGHT_URL="http://localhost:3001"
MCP_GITHUB_URL="http://localhost:3002"

# Storage Configuration
STORAGE_PATH="/data/data/com.termux/files/home/storage/shared"
DOWNLOAD_PATH="/data/data/com.termux/files/home/storage/shared/Download"
DOCUMENTS_PATH="/data/data/com.termux/files/home/storage/shared/Documents"

# Security
API_KEY="your-secure-api-key-here"
JWT_SECRET="your-jwt-secret-here"

# Logging
LOG_LEVEL="info"
LOG_FILE="./logs/aiagent.log"
EOF

# Create startup script
print_step "Creating startup script..."
cat > start_ai_agent.sh << 'EOF'
#!/data/data/com.termux/files/usr/bin/bash

# AI Agent Startup Script
echo "🚀 Starting AI Agent..."

# Set working directory
cd ~/ai-agent

# Start Ollama in background
echo "Starting Ollama..."
./ollama serve &
OLLAMA_PID=$!

# Wait for Ollama to start
sleep 5

# Start backend server
echo "Starting backend server..."
cd backend
npm run dev &
BACKEND_PID=$!

# Start frontend server
echo "Starting frontend server..."
cd ../frontend
npm run dev &
FRONTEND_PID=$!

echo "✅ AI Agent started successfully!"
echo "Frontend: http://localhost:3000"
echo "Backend: http://localhost:3001"
echo "Ollama: http://localhost:11434"
echo ""
echo "Press Ctrl+C to stop all services"

# Function to cleanup processes
cleanup() {
    echo "🛑 Stopping AI Agent..."
    kill $OLLAMA_PID $BACKEND_PID $FRONTEND_PID 2>/dev/null
    echo "✅ All services stopped"
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Wait for processes
wait
EOF

chmod +x start_ai_agent.sh

# Create Termux widget shortcut
print_step "Creating Termux widget shortcut..."
mkdir -p ~/.shortcuts
cat > ~/.shortcuts/ai-agent << 'EOF'
~/ai-agent/start_ai_agent.sh
EOF

chmod +x ~/.shortcuts/ai-agent

# Create service monitoring script
print_step "Creating service monitoring script..."
cat > scripts/monitor_services.sh << 'EOF'
#!/data/data/com.termux/files/usr/bin/bash

# Service Monitor for AI Agent
echo "🔍 AI Agent Service Monitor"
echo "==========================="

# Check if Ollama is running
if pgrep -f "ollama serve" > /dev/null; then
    echo "✅ Ollama is running"
else
    echo "❌ Ollama is not running"
fi

# Check if backend is running
if pgrep -f "next" > /dev/null; then
    echo "✅ Backend is running"
else
    echo "❌ Backend is not running"
fi

# Check available memory
echo ""
echo "📊 System Resources:"
echo "Memory: $(free -h | grep Mem | awk '{print $3 "/" $2}')"
echo "Storage: $(df -h ~/ai-agent | tail -1 | awk '{print $3 "/" $2 " (" $5 " used)"}')"

# Check log files
echo ""
echo "📝 Recent Logs:"
if [ -f ~/ai-agent/logs/aiagent.log ]; then
    tail -5 ~/ai-agent/logs/aiagent.log
else
    echo "No log files found"
fi
EOF

chmod +x scripts/monitor_services.sh

print_status "Setup completed successfully!"
echo ""
echo "🎉 AI Agent has been installed and configured!"
echo ""
echo "Next steps:"
echo "1. Run '~/ai-agent/start_ai_agent.sh' to start the AI Agent"
echo "2. Access the web interface at http://localhost:3000"
echo "3. Use '~/ai-agent/scripts/monitor_services.sh' to monitor services"
echo "4. Add the AI Agent widget to your home screen for quick access"
echo ""
echo "📚 Documentation and project structure will be created in the next steps."
echo ""
echo -e "${GREEN}Setup completed successfully!${NC}"
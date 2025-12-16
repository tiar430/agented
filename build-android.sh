#!/data/data/com.termux/files/usr/bin/bash

# AI Agent Build and Publish Script for Android Termux
# Senior Software Developer - Mobile Apps & Debugging Engineer
# 15+ Years Experience at Google, Microsoft, Amazon

set -e

echo "🚀 AI Agent Build & Publish for Android Termux"
echo "=============================================="

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

# Configuration
PROJECT_DIR="$HOME/ai-agent"
BUILD_DIR="$PROJECT_DIR/build"
DIST_DIR="$PROJECT_DIR/dist"
ANDROID_APP_DIR="$PROJECT_DIR/android-app"
PACKAGE_NAME="com.example.aiagent"
VERSION="1.0.0"

# Clean previous builds
print_step "Cleaning previous builds..."
rm -rf "$BUILD_DIR" "$DIST_DIR" "$ANDROID_APP_DIR"
mkdir -p "$BUILD_DIR" "$DIST_DIR" "$ANDROID_APP_DIR"

# Install dependencies
print_step "Installing dependencies..."
cd "$PROJECT_DIR"
if [ -f "package.json" ]; then
    npm install --production
else
    print_error "package.json not found. Please run this script from the project root."
    exit 1
fi

# Generate Prisma client
print_step "Generating Prisma client..."
npm run db:generate

# Build the Next.js application
print_step "Building Next.js application..."
npm run build

# Copy built files to distribution directory
print_step "Preparing distribution files..."
cp -r .next/standalone/* "$DIST_DIR/"
cp -r public "$DIST_DIR/"
cp package.json "$DIST_DIR/"
cp -r .next/static "$DIST_DIR/.next/"

# Create Android app structure
print_step "Creating Android app structure..."
mkdir -p "$ANDROID_APP_DIR"/{assets,lib,res/values}

# Create Android manifest
print_step "Creating Android manifest..."
cat > "$ANDROID_APP_DIR/AndroidManifest.xml" << 'EOF'
<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.example.aiagent"
    android:versionCode="1"
    android:versionName="1.0.0">

    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    <uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
    <uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
    <uses-permission android:name="android.permission.MANAGE_EXTERNAL_STORAGE" />
    <uses-permission android:name="android.permission.WAKE_LOCK" />
    <uses-permission android:name="android.permission.FOREGROUND_SERVICE" />

    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:theme="@android:style/Theme.Material.Light"
        android:usesCleartextTraffic="true">

        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:label="@string/app_name"
            android:theme="@android:style/Theme.Material.Light.NoActionBar">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>

        <service
            android:name=".AIAgentService"
            android:enabled="true"
            android:exported="false"
            android:foregroundServiceType="dataSync" />

    </application>
</manifest>
EOF

# Create strings resource
print_step "Creating Android resources..."
cat > "$ANDROID_APP_DIR/res/values/strings.xml" << EOF
<?xml version="1.0" encoding="utf-8"?>
<resources>
    <string name="app_name">AI Agent</string>
    <string name="service_description">AI Agent Background Service</string>
</resources>
EOF

# Create Node.js service wrapper
print_step "Creating Node.js service wrapper..."
cat > "$ANDROID_APP_DIR/ai-agent-service.js" << 'EOF'
#!/data/data/com.termux/files/usr/bin/node

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const SERVICE_DIR = path.dirname(__filename);
const NODE_MODULES_PATH = path.join(SERVICE_DIR, 'node_modules');
const SERVER_PATH = path.join(SERVICE_DIR, 'server.js');

// Add node_modules to PATH
process.env.NODE_PATH = NODE_MODULES_PATH;
process.env.NODE_ENV = 'production';
process.env.PORT = '3000';

console.log('🤖 Starting AI Agent Service...');
console.log('Service directory:', SERVICE_DIR);
console.log('Server path:', SERVER_PATH);

// Check if server.js exists
if (!fs.existsSync(SERVER_PATH)) {
    console.error('❌ server.js not found at:', SERVER_PATH);
    process.exit(1);
}

// Start the server
const serverProcess = spawn('node', [SERVER_PATH], {
    stdio: 'inherit',
    env: process.env,
    cwd: SERVICE_DIR
});

serverProcess.on('error', (error) => {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
});

serverProcess.on('exit', (code) => {
    console.log('📱 AI Agent Service exited with code:', code);
    process.exit(code);
});

// Handle process termination
process.on('SIGTERM', () => {
    console.log('🛑 Received SIGTERM, shutting down gracefully...');
    serverProcess.kill('SIGTERM');
});

process.on('SIGINT', () => {
    console.log('🛑 Received SIGINT, shutting down gracefully...');
    serverProcess.kill('SIGINT');
});
EOF

chmod +x "$ANDROID_APP_DIR/ai-agent-service.js"

# Create Termux bootstrap script
print_step "Creating Termux bootstrap script..."
cat > "$ANDROID_APP_DIR/bootstrap.sh" << 'EOF'
#!/data/data/com.termux/files/usr/bin/bash

# AI Agent Bootstrap Script for Termux
echo "🚀 Bootstrapping AI Agent..."

# Set environment variables
export NODE_ENV=production
export PORT=3000
export ANDROID_STORAGE_PATH="/storage/emulated/0"
export DATABASE_URL="file:./data/aiagent.db"

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Create data directory
mkdir -p data

# Start the service
exec ./ai-agent-service.js
EOF

chmod +x "$ANDROID_APP_DIR/bootstrap.sh"

# Create Termux widget shortcut
print_step "Creating Termux widget shortcut..."
mkdir -p ~/.shortcuts
cat > ~/.shortcuts/ai-agent-start << EOF
cd $ANDROID_APP_DIR && ./bootstrap.sh
EOF

chmod +x ~/.shortcuts/ai-agent-start

# Create Termux widget shortcut for stop
cat > ~/.shortcuts/ai-agent-stop << 'EOF'
pkill -f ai-agent-service
EOF

chmod +x ~/.shortcuts/ai-agent-stop

# Copy distribution files to Android app directory
print_step "Copying distribution files..."
cp -r "$DIST_DIR"/* "$ANDROID_APP_DIR/"

# Install production dependencies in Android app directory
print_step "Installing production dependencies..."
cd "$ANDROID_APP_DIR"
npm install --production

# Create startup script for Termux
print_step "Creating startup script..."
cat > "$PROJECT_DIR/start-android.sh" << EOF
#!/data/data/com.termux/files/usr/bin/bash

# AI Agent Android Startup Script
echo "🤖 Starting AI Agent for Android..."

# Navigate to Android app directory
cd "$ANDROID_APP_DIR"

# Start the service
./bootstrap.sh
EOF

chmod +x "$PROJECT_DIR/start-android.sh"

# Create installation script
print_step "Creating installation script..."
cat > "$PROJECT_DIR/install-android.sh" << 'EOF'
#!/data/data/com.termux/files/usr/bin/bash

# AI Agent Android Installation Script
echo "📱 Installing AI Agent for Android..."

# Check if running in Termux
if [ ! -d "/data/data/com.termux" ]; then
    echo "❌ This script must be run in Termux environment"
    exit 1
fi

# Request storage permissions
echo "📋 Requesting storage permissions..."
termux-setup-storage

# Update packages
echo "📦 Updating Termux packages..."
pkg update -y && pkg upgrade -y

# Install required packages
echo "📦 Installing required packages..."
pkg install -y nodejs npm python git make clang

# Create installation directory
INSTALL_DIR="$HOME/ai-agent"
echo "📁 Creating installation directory: $INSTALL_DIR"
mkdir -p "$INSTALL_DIR"

# Copy files if running from source
if [ -f "./build-android.sh" ]; then
    echo "📋 Copying files..."
    cp -r . "$INSTALL_DIR/"
    cd "$INSTALL_DIR"
fi

# Install dependencies
echo "📦 Installing Node.js dependencies..."
npm install

# Build the application
echo "🔨 Building the application..."
./build-android.sh

# Create desktop shortcut
echo "🔗 Creating desktop shortcut..."
mkdir -p ~/Desktop
cat > ~/Desktop/AI-Agent.desktop << 'EOL'
[Desktop Entry]
Version=1.0
Type=Application
Name=AI Agent
Comment=AI Agent for Android
Exec=termux-open-url http://localhost:3000
Icon=ai-agent
Terminal=false
Categories=Development;
EOL

echo "✅ Installation completed successfully!"
echo ""
echo "🎉 AI Agent has been installed on your Android device!"
echo ""
echo "📱 To start the application:"
echo "1. Run: ~/ai-agent/start-android.sh"
echo "2. Or use the Termux widget: AI Agent Start"
echo "3. Open browser and go to: http://localhost:3000"
echo ""
echo "🔧 To stop the application:"
echo "1. Run: termux-shortcut AI Agent Stop"
echo "2. Or use: pkill -f ai-agent-service"
echo ""
echo "📚 For more information, see the documentation."
EOF

chmod +x "$PROJECT_DIR/install-android.sh"

# Create update script
print_step "Creating update script..."
cat > "$PROJECT_DIR/update-android.sh" << 'EOF'
#!/data/data/com.termux/files/usr/bin/bash

# AI Agent Android Update Script
echo "🔄 Updating AI Agent for Android..."

# Navigate to project directory
cd "$(dirname "$0")"

# Pull latest changes if it's a git repository
if [ -d ".git" ]; then
    echo "📥 Pulling latest changes..."
    git pull origin main
fi

# Install/update dependencies
echo "📦 Updating dependencies..."
npm install

# Rebuild the application
echo "🔨 Rebuilding application..."
./build-android.sh

# Restart service if running
if pgrep -f "ai-agent-service" > /dev/null; then
    echo "🛑 Stopping current service..."
    pkill -f "ai-agent-service"
    sleep 2
    
    echo "🚀 Starting updated service..."
    ./start-android.sh &
fi

echo "✅ Update completed successfully!"
EOF

chmod +x "$PROJECT_DIR/update-android.sh"

# Create documentation
print_step "Creating documentation..."
cat > "$PROJECT_DIR/README-ANDROID.md" << 'EOF'
# AI Agent for Android

AI Agent with Multi-Tasking capabilities for Android devices using Termux.

## Features

- 🤖 Multi-Tasking AI Agent
- 📱 Android-optimized interface
- 🗂️ Full file system access
- 🌐 Web scraping capabilities
- 📊 Data analysis tools
- 🔄 GitHub integration
- 💾 Local AI with Ollama
- 🔒 Secure and private

## Installation

### Prerequisites

1. Install Termux from F-Droid
2. Launch Termux and run:

```bash
# Update packages
pkg update && pkg upgrade

# Install required packages
pkg install nodejs npm python git make clang

# Clone or download the project
git clone <repository-url> ai-agent
cd ai-agent

# Run installation script
./install-android.sh
```

### Quick Start

1. Start the application:
   ```bash
   ./start-android.sh
   ```

2. Or use the Termux widget: "AI Agent Start"

3. Open browser and go to: http://localhost:3000

## Usage

### Chat Interface
- Interact with the AI assistant through natural language
- Request file operations, web scraping, data analysis
- Get real-time responses and task updates

### File Management
- Full access to Android storage
- Organize files automatically
- Read, write, delete, move, copy operations

### Web Scraping
- Extract data from websites
- Automated data collection
- Export to various formats

### Data Analysis
- Analyze CSV, JSON, text files
- Generate insights and reports
- Visualize data patterns

## Configuration

### Environment Variables
- `PORT`: Server port (default: 3000)
- `ANDROID_STORAGE_PATH`: Android storage path
- `DATABASE_URL`: Database connection string
- `OLLAMA_HOST`: Ollama server URL

### AI Models
- Default: phi-2
- Compatible with Ollama models
- Automatic fallback to cloud AI

## Troubleshooting

### Common Issues

1. **Port already in use**
   ```bash
   # Kill existing process
   pkill -f ai-agent-service
   ```

2. **Storage permissions**
   ```bash
   # Request storage permissions
   termux-setup-storage
   ```

3. **Database errors**
   ```bash
   # Reset database
   rm -f ./data/aiagent.db
   npm run db:push
   ```

### Logs

Check application logs:
```bash
# View real-time logs
tail -f ./logs/aiagent.log

# View error logs
cat ./logs/error.log
```

## Development

### Project Structure
```
ai-agent/
├── src/                 # Source code
├── android-app/         # Android-specific files
├── build/              # Build artifacts
├── dist/               # Distribution files
├── logs/               # Application logs
└── data/               # Database and data files
```

### Building
```bash
# Build for Android
./build-android.sh

# Update existing installation
./update-android.sh
```

## Security

- All data processed locally
- No data sent to external servers (unless using cloud AI)
- Secure file system access
- Encrypted communications

## Support

For issues and support:
1. Check the troubleshooting section
2. Review the logs
3. Create an issue on GitHub

## License

MIT License - see LICENSE file for details.
EOF

# Test the build
print_step "Testing the build..."
cd "$ANDROID_APP_DIR"
if [ -f "package.json" ] && [ -f "server.js" ]; then
    print_status "✅ Build test passed - All required files present"
else
    print_error "❌ Build test failed - Missing required files"
    exit 1
fi

# Create summary
print_status "Build completed successfully!"
echo ""
echo "📱 Android Package Summary:"
echo "📁 Location: $ANDROID_APP_DIR"
echo "📦 Size: $(du -sh "$ANDROID_APP_DIR" | cut -f1)"
echo "🔧 Startup script: $PROJECT_DIR/start-android.sh"
echo "📱 Widget shortcuts: ~/.shortcuts/ai-agent-*"
echo ""
echo "🚀 To start the application:"
echo "1. Run: $PROJECT_DIR/start-android.sh"
echo "2. Or use Termux widget: AI Agent Start"
echo "3. Open browser: http://localhost:3000"
echo ""
echo "📚 Documentation: $PROJECT_DIR/README-ANDROID.md"
echo ""
echo -e "${GREEN}✅ AI Agent for Android build completed successfully!${NC}"
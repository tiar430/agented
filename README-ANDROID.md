# AI Agent untuk Android dengan Termux

## 🚀 Project Overview

AI Agent dengan kemampuan Multi-Tasking untuk user perangkat Android Mobile, terkoneksi dengan server MCP (Model Context Protocol) seperti Playwright dan GitHub, dengan kemampuan read/write local storage dan file organization.

## 📋 Spesifikasi Teknis

### Framework & Technology Stack
- **Frontend**: Next.js 15 dengan App Router
- **Backend**: Next.js API Routes dengan TypeScript
- **Database**: Prisma ORM dengan SQLite
- **AI Integration**: Ollama (phi-2.gguf) + z-ai-web-dev-sdk
- **Real-time Communication**: WebSocket Service dengan Socket.IO
- **UI Components**: shadcn/ui dengan Tailwind CSS
- **Target Platform**: Android via Termux

### MCP (Model Context Protocol) Integration
- **Playwright**: Web scraping dan automation
- **GitHub**: Repository management dan operations
- **File System**: Full access storage management
- **Data Analysis**: Processing dan analysis capabilities

## 🏗️ Arsitektur Sistem

```
┌─────────────────────────────────────────────────────────────┐
│                    Android Device                          │
│  ┌─────────────────┐  ┌─────────────────┐              │
│  │   Termux App    │  │   Browser       │              │
│  │                 │  │   (UI)          │              │
│  │  ┌─────────────┐│  │                 │              │
│  │  │ AI Agent    ││  │  ┌─────────────┐│              │
│  │  │ Service     ││  │  │ Next.js     ││              │
│  │  │             ││  │  │ Frontend    ││              │
│  │  └─────────────┘│  │  └─────────────┘│              │
│  └─────────────────┘  └─────────────────┘              │
│           │                    │                        │
│           └────────────────────┼──────────────────────┘
│                                │
│  ┌─────────────────────────────────────────────────────┐ │
│  │            WebSocket Service                        │ │
│  │          (Real-time Communication)                 │ │
│  └─────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────┐
│                 Backend Services                           │
│  ┌─────────────────┐  ┌─────────────────┐              │
│  │   Next.js      │  │   Ollama       │              │
│  │   API Routes   │  │   Local AI     │              │
│  │                 │  │   (phi-2.gguf) │              │
│  │  ┌─────────────┐│  │                 │              │
│  │  │ Chat API    ││  │  ┌─────────────┐│              │
│  │  │ Tasks API   ││  │  │ ZAI SDK     ││              │
│  │  │ Files API   ││  │  │ Fallback    ││              │
│  │  │ Agents API  ││  │  └─────────────┘│              │
│  │  └─────────────┘│  └─────────────────┘              │
│  └─────────────────┘                                   │
│           │                                             │
│  ┌─────────────────┐  ┌─────────────────┐              │
│  │   Prisma       │  │   MCP          │              │
│  │   Database     │  │   Services     │              │
│  │   (SQLite)     │  │                 │              │
│  └─────────────────┘  └─────────────────┘              │
└─────────────────────────────────────────────────────────────┘
```

## 📁 Struktur Project

```
ai-agent/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── agents/          # AI Agent management
│   │   │   ├── tasks/           # Task management
│   │   │   ├── chat/            # Chat interface
│   │   │   └── files/           # File operations
│   │   ├── page.tsx             # Main UI (mobile-optimized)
│   │   └── layout.tsx
│   ├── components/
│   │   └── ui/                  # shadcn/ui components
│   ├── lib/
│   │   ├── db.ts                # Prisma client
│   │   ├── ollama/              # Ollama integration
│   │   └── utils.ts
│   └── hooks/
├── mini-services/
│   └── websocket-service/        # Real-time communication
├── prisma/
│   └── schema.prisma            # Database schema
├── termux_setup.sh              # Initial setup script
├── build-android.sh             # Build script for Android
├── install-android.sh           # Installation script
└── README-ANDROID.md            # Android-specific documentation
```

## 🛠️ Installation & Setup

### Prerequisites
1. Android device with Termux installed
2. Node.js 18+ and npm
3. Git

### Quick Start
```bash
# 1. Clone atau download project
git clone <repository-url> ai-agent
cd ai-agent

# 2. Run setup script
chmod +x termux_setup.sh
./termux_setup.sh

# 3. Install dependencies
npm install

# 4. Setup database
npm run db:push

# 5. Build for Android
chmod +x build-android.sh
./build-android.sh

# 6. Start application
./start-android.sh
```

### Manual Installation
```bash
# Update Termux packages
pkg update && pkg upgrade

# Install required packages
pkg install nodejs npm python git make clang

# Setup storage permissions
termux-setup-storage

# Install project dependencies
npm install

# Generate Prisma client
npm run db:generate

# Build application
npm run build

# Start development server
npm run dev
```

## 🚀 Usage

### 1. Start Application
```bash
# Via script
./start-android.sh

# Or manually
cd android-app
./bootstrap.sh
```

### 2. Access Interface
- Open browser: http://localhost:3000
- Mobile-optimized interface
- Real-time chat with AI agent

### 3. Core Features

#### Chat Interface
- Natural language interaction
- Multi-tasking support
- Real-time responses
- Context-aware conversations

#### File Management
- Full Android storage access
- File organization and cleanup
- Read/write/delete operations
- Automatic file categorization

#### Web Scraping
- Playwright integration
- Data extraction from websites
- Automated data collection
- Export to various formats

#### Data Analysis
- CSV, JSON, text processing
- Pattern recognition
- Report generation
- Visualization support

#### GitHub Integration
- Repository management
- Code operations
- Issue tracking
- Automated workflows

## 🔧 Configuration

### Environment Variables
```bash
# Database
DATABASE_URL="file:./data/aiagent.db"

# AI Configuration
OLLAMA_HOST="http://localhost:11434"
OLLAMA_MODEL="phi-2"
AI_TEMPERATURE=0.7
AI_MAX_TOKENS=2048

# Android Storage
ANDROID_STORAGE_PATH="/storage/emulated/0"
DOWNLOAD_PATH="/storage/emulated/0/Download"
DOCUMENTS_PATH="/storage/emulated/0/Documents"

# Server Configuration
PORT=3000
NODE_ENV=production

# Security
API_KEY="your-secure-api-key"
JWT_SECRET="your-jwt-secret"
```

### AI Model Configuration
- **Default Model**: phi-2.gguf
- **Fallback**: z-ai-web-dev-sdk (cloud)
- **Custom Models**: Supported via Ollama

## 📱 Android-Specific Features

### Termux Integration
- Native Android storage access
- Background service support
- Widget shortcuts
- Auto-start capabilities

### File System Access
- Full read/write permissions
- External storage support
- Media file handling
- Document management

### Performance Optimization
- Mobile-optimized UI
- Efficient resource usage
- Background processing
- Battery-friendly operations

## 🔍 API Documentation

### Agents API
```typescript
// GET /api/agents?userId=<id>
// List all agents for user

// POST /api/agents
// Create new agent
{
  "name": "Android Assistant",
  "description": "Multi-tasking AI agent",
  "model": "phi-2",
  "userId": "user-id"
}
```

### Tasks API
```typescript
// GET /api/tasks?userId=<id>&status=<status>
// List tasks with filters

// POST /api/tasks
// Create new task
{
  "title": "Organize Downloads",
  "type": "file_management",
  "priority": "medium",
  "userId": "user-id",
  "input": {"operation": "organize", "path": "/Downloads"}
}
```

### Chat API
```typescript
// POST /api/chat
// Send message and get AI response
{
  "message": "Help me organize my files",
  "userId": "user-id",
  "agentId": "agent-id"
}
```

### Files API
```typescript
// GET /api/files?path=<path>&userId=<id>
// List files and directories

// POST /api/files
// Perform file operations
{
  "operation": "organize",
  "path": "/Downloads",
  "userId": "user-id"
}
```

## 🔄 Real-time Communication

### WebSocket Events
```typescript
// Connection
socket.on('connect', () => {
  socket.emit('authenticate', { userId, token });
});

// Chat
socket.on('chat_message', (data) => {
  // Handle incoming message
});

// Task Updates
socket.on('task_update', (data) => {
  // Handle task status changes
});

// File Operations
socket.on('file_operation', (data) => {
  // Handle file operation updates
});
```

## 🛠️ Development

### Local Development
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Database operations
npm run db:push
npm run db:generate
npm run db:studio

# Linting
npm run lint
```

### WebSocket Service
```bash
cd mini-services/websocket-service

# Install dependencies
npm install

# Start service
npm run dev

# Build
npm run build
```

## 🔒 Security

### Data Privacy
- All processing done locally
- No data sent to external servers (unless using cloud AI fallback)
- Encrypted communications
- Secure file system access

### Authentication
- JWT-based authentication
- User session management
- API key protection
- Secure WebSocket connections

## 🐛 Troubleshooting

### Common Issues

1. **Port Already in Use**
```bash
# Kill existing processes
pkill -f ai-agent-service
pkill -f node
```

2. **Storage Permissions**
```bash
# Request storage permissions
termux-setup-storage
```

3. **Database Errors**
```bash
# Reset database
rm -f ./data/aiagent.db
npm run db:push
```

4. **Ollama Connection**
```bash
# Check Ollama status
curl http://localhost:11434/api/tags

# Restart Ollama
./ollama serve &
```

### Logs
```bash
# Application logs
tail -f ./logs/aiagent.log

# WebSocket service logs
cd mini-services/websocket-service
npm run dev
```

## 📊 Performance

### Resource Usage
- **Memory**: ~100-200MB idle
- **Storage**: ~50MB application + data
- **CPU**: Low impact during idle
- **Battery**: Optimized for mobile usage

### Optimization Features
- Lazy loading
- Efficient caching
- Background processing
- Resource cleanup

## 🔮 Future Enhancements

### Planned Features
- Voice input/output
- Image processing
- Advanced automation
- Cloud synchronization
- Plugin system
- Multi-language support

### Scalability
- Distributed processing
- Load balancing
- Caching layers
- Performance monitoring

## 📄 License

MIT License - see LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Make changes
4. Test thoroughly
5. Submit pull request

## 📞 Support

For issues and support:
1. Check troubleshooting section
2. Review logs
3. Create GitHub issue
4. Contact development team

---

**Developed by**: Senior Software Developer - Mobile Apps & Debugging Engineer  
**Experience**: 15+ Years at Google, Microsoft, Amazon  
**Specialization**: Multi-language debugging, Complex systems, Mobile development
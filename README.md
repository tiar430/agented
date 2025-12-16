# AI Agent for Android with Termux

A comprehensive AI Agent system designed for Android devices running Termux, featuring multi-tasking capabilities, MCP (Model Context Protocol) integration, and local AI support.

## 🚀 Features

### Core Capabilities
- **Multi-tasking AI Agent**: Handle multiple concurrent tasks with intelligent scheduling
- **MCP Integration**: Native support for Playwright, GitHub, and File System protocols
- **Local AI Support**: Run phi-2.gguf model locally with Ollama integration
- **Full Android Storage Access**: Complete file system access and organization
- **Real-time Communication**: WebSocket-based real-time chat and notifications
- **Advanced Memory System**: Dual storage (database + local file system) for persistent memory

### Technical Stack
- **Frontend**: Next.js 15 with App Router, TypeScript, Tailwind CSS
- **Backend**: Next.js API routes with Prisma ORM
- **Database**: SQLite with Prisma Client
- **UI Components**: shadcn/ui component library
- **Real-time**: Socket.IO for WebSocket communication
- **AI Integration**: Ollama (local) + Z.ai Web SDK (fallback)
- **Mobile Optimization**: Responsive design optimized for Android devices

## 📱 Mobile-Optimized Interface

The application features a fully responsive design optimized for mobile devices:
- Touch-friendly interface with minimum 44px touch targets
- Adaptive layouts for different screen sizes
- Dark mode support with system preference detection
- Gesture support and smooth animations

## 🛠️ Installation & Setup

### Prerequisites
- Android device with Termux installed
- Node.js 18+ and Bun package manager
- Git for version control

### Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/tiar430/agented.git
   cd agented
   ```

2. **Install dependencies**
   ```bash
   bun install
   ```

3. **Set up the database**
   ```bash
   bun run db:push
   ```

4. **Start the development server**
   ```bash
   bun run dev
   ```

5. **Access the application**
   - Open your browser and navigate to `http://localhost:3000`
   - On Android, access via `http://localhost:3000` in Termux

### Termux Environment Setup

For complete Android Termux setup, run the provided setup script:

```bash
chmod +x termux_setup.sh
./termux_setup.sh
```

This script will:
- Install required Termux packages
- Set up Node.js and Bun
- Configure Ollama for local AI
- Set up development environment
- Initialize the database

## 🏗️ Project Structure

```
agented/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API routes
│   │   │   ├── agents/        # AI Agent management
│   │   │   ├── tasks/         # Task management
│   │   │   ├── chat/          # Chat interface
│   │   │   ├── files/         # File operations
│   │   │   ├── mcp/           # MCP connections
│   │   │   └── memory/        # Memory management
│   │   ├── page.tsx           # Main application page
│   │   └── layout.tsx         # Root layout
│   ├── components/            # React components
│   │   ├── ui/               # shadcn/ui components
│   │   ├── SideMenu.tsx      # Advanced side menu
│   │   └── ErrorBoundary.tsx # Error handling
│   ├── lib/                  # Utility libraries
│   │   ├── db.ts            # Database client
│   │   ├── ollama/          # Ollama integration
│   │   └── utils.ts         # Helper functions
│   └── hooks/               # Custom React hooks
├── prisma/
│   └── schema.prisma        # Database schema
├── public/                  # Static assets
├── mini-services/          # Microservices
├── termux_setup.sh         # Termux setup script
├── build-android.sh        # Android build script
└── README.md
```

## 🔧 Configuration

### Environment Variables

Create a `.env.local` file in the root directory:

```env
# Database
DATABASE_URL="file:./dev.db"

# AI Services
OLLAMA_URL="http://localhost:11434"
ZAI_API_KEY="your-zai-api-key"

# WebSocket
WEBSOCKET_PORT=3001

# Development
NODE_ENV="development"
```

### Database Schema

The application uses Prisma with SQLite, featuring:
- **AI Agents**: Agent definitions with capabilities and status
- **Tasks**: Task management with execution tracking
- **Chat Messages**: Conversation history with context
- **File Operations**: File system access and organization
- **MCP Connections**: MCP server configurations
- **Memory System**: User preferences and context storage

## 🤖 AI Integration

### Local AI (Ollama)
- **Model**: phi-2.gguf for efficient on-device processing
- **Fallback**: Z.ai Web SDK for cloud-based processing
- **Features**: Context awareness, memory integration, task automation

### MCP (Model Context Protocol)
- **Playwright**: Web automation and scraping
- **GitHub**: Repository management and operations
- **File System**: Complete file access and organization
- **Custom**: Extensible protocol support

## 📱 Mobile Features

### Android Integration
- **Storage Access**: Full Android file system access
- **Termux Integration**: Native Termux environment support
- **Performance**: Optimized for mobile hardware constraints
- **Battery**: Efficient resource management

### Responsive Design
- **Mobile-First**: Designed specifically for mobile devices
- **Touch Interface**: Optimized touch interactions
- **Gesture Support**: Swipe gestures and mobile patterns
- **Adaptive UI**: Dynamic layout adjustment

## 🔄 Real-time Features

### WebSocket Communication
- **Live Chat**: Real-time messaging with AI agents
- **Task Updates**: Live task status updates
- **File Sync**: Real-time file operation notifications
- **System Status**: Live system health monitoring

## 🛡️ Security & Privacy

### Data Protection
- **Local Processing**: AI processing happens locally when possible
- **Data Encryption**: Encrypted data storage and transmission
- **Privacy First**: User data stays on device
- **Secure Communication**: HTTPS/WSS for all communications

## 🚀 Deployment

### Development
```bash
bun run dev
```

### Production Build
```bash
bun run build
bun run start
```

### Android Deployment
```bash
chmod +x build-android.sh
./build-android.sh
```

## 📚 API Documentation

### Core Endpoints

#### AI Agents
- `GET /api/agents` - List all agents
- `POST /api/agents` - Create new agent
- `PUT /api/agents/[id]` - Update agent
- `DELETE /api/agents/[id]` - Delete agent

#### Tasks
- `GET /api/tasks` - List tasks
- `POST /api/tasks` - Create task
- `PUT /api/tasks/[id]/status` - Update task status

#### Chat
- `POST /api/chat` - Send message to AI
- `GET /api/chat/history` - Get conversation history

#### Files
- `GET /api/files` - List files
- `POST /api/files/upload` - Upload file
- `DELETE /api/files/[path]` - Delete file

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Next.js Team** - Excellent React framework
- **Prisma** - Modern database toolkit
- **shadcn/ui** - Beautiful UI components
- **Ollama** - Local AI model support
- **Termux** - Android terminal environment

## 📞 Support

For support and questions:
- Create an issue on GitHub
- Check the [Wiki](https://github.com/tiar430/agented/wiki) for documentation
- Join our community discussions

---

**Built with ❤️ for Android developers and AI enthusiasts**
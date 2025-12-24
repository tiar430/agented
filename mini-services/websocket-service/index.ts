import { Server } from 'socket.io';
import { createServer } from 'http';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const PORT = parseInt(process.env.PORT || '3003');
const HOST = process.env.HOST || '0.0.0.0';

// Create HTTP server
const httpServer = createServer();

// Configure CORS
const corsMiddleware = cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  credentials: true,
});

// Apply CORS middleware
httpServer.on('request', corsMiddleware);

// Create Socket.IO server
const io = new Server(httpServer, {
  cors: {
    origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
    methods: ['GET', 'POST'],
    credentials: true,
  },
  transports: ['websocket', 'polling'],
});

// Store active connections and sessions
const activeConnections = new Map<string, any>();
const activeSessions = new Map<string, any>();

// Logger
const logger = {
  info: (message: string, data?: any) => {
    console.log(`[INFO] ${new Date().toISOString()}: ${message}`, data || '');
  },
  error: (message: string, error?: any) => {
    console.error(`[ERROR] ${new Date().toISOString()}: ${message}`, error || '');
  },
  warn: (message: string, data?: any) => {
    console.warn(`[WARN] ${new Date().toISOString()}: ${message}`, data || '');
  },
};

// Socket.IO connection handler
io.on('connection', (socket) => {
  const connectionId = uuidv4();
  
  logger.info('New connection established', {
    socketId: socket.id,
    connectionId,
    userAgent: socket.handshake.headers['user-agent'],
  });

  // Store connection info
  activeConnections.set(socket.id, {
    id: connectionId,
    socketId: socket.id,
    connectedAt: new Date(),
    userAgent: socket.handshake.headers['user-agent'],
    userId: null,
    sessionId: null,
  });

  // Send welcome message
  socket.emit('welcome', {
    message: 'Connected to AI Agent WebSocket service',
    connectionId,
    timestamp: new Date().toISOString(),
  });

  // Handle user authentication
  socket.on('authenticate', (data) => {
    try {
      const { userId, token } = data;
      
      // Update connection with user info
      const connection = activeConnections.get(socket.id);
      if (connection) {
        connection.userId = userId;
        connection.authenticatedAt = new Date();
      }

      logger.info('User authenticated', { userId, socketId: socket.id });
      
      socket.emit('authenticated', {
        success: true,
        userId,
        timestamp: new Date().toISOString(),
      });

      // Join user-specific room
      socket.join(`user:${userId}`);
    } catch (error) {
      logger.error('Authentication failed', error);
      socket.emit('authentication_error', {
        success: false,
        error: 'Authentication failed',
        timestamp: new Date().toISOString(),
      });
    }
  });

  // Handle session creation
  socket.on('join_session', (data) => {
    try {
      const { sessionId, userId } = data;
      
      // Store session info
      activeSessions.set(sessionId, {
        id: sessionId,
        userId,
        socketId: socket.id,
        createdAt: new Date(),
        lastActivity: new Date(),
      });

      // Join session-specific room
      socket.join(`session:${sessionId}`);
      
      const connection = activeConnections.get(socket.id);
      if (connection) {
        connection.sessionId = sessionId;
      }

      logger.info('User joined session', { sessionId, userId, socketId: socket.id });
      
      socket.emit('session_joined', {
        sessionId,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('Failed to join session', error);
      socket.emit('session_error', {
        error: 'Failed to join session',
        timestamp: new Date().toISOString(),
      });
    }
  });

  // Handle chat messages
  socket.on('chat_message', (data) => {
    try {
      const { sessionId, message, userId } = data;
      
      // Update session activity
      const session = activeSessions.get(sessionId);
      if (session) {
        session.lastActivity = new Date();
      }

      // Broadcast message to session room
      io.to(`session:${sessionId}`).emit('chat_message', {
        id: uuidv4(),
        sessionId,
        userId,
        message,
        type: 'user',
        timestamp: new Date().toISOString(),
      });

      logger.info('Chat message sent', { sessionId, userId, messageLength: message?.length });
    } catch (error) {
      logger.error('Failed to send chat message', error);
      socket.emit('chat_error', {
        error: 'Failed to send message',
        timestamp: new Date().toISOString(),
      });
    }
  });

  // Handle task status updates
  socket.on('task_update', (data) => {
    try {
      const { taskId, status, userId, sessionId } = data;
      
      // Broadcast task update to relevant rooms
      const rooms = [];
      if (userId) rooms.push(`user:${userId}`);
      if (sessionId) rooms.push(`session:${sessionId}`);
      
      rooms.forEach(room => {
        io.to(room).emit('task_update', {
          taskId,
          status,
          timestamp: new Date().toISOString(),
        });
      });

      logger.info('Task update broadcasted', { taskId, status, rooms });
    } catch (error) {
      logger.error('Failed to broadcast task update', error);
    }
  });

  // Handle file operation updates
  socket.on('file_operation', (data) => {
    try {
      const { operation, path, status, userId } = data;
      
      // Broadcast to user room
      if (userId) {
        io.to(`user:${userId}`).emit('file_operation', {
          operation,
          path,
          status,
          timestamp: new Date().toISOString(),
        });
      }

      logger.info('File operation broadcasted', { operation, path, status, userId });
    } catch (error) {
      logger.error('Failed to broadcast file operation', error);
    }
  });

  // Handle AI agent status updates
  socket.on('agent_status', (data) => {
    try {
      const { agentId, status, userId, sessionId } = data;
      
      // Broadcast to relevant rooms
      const rooms = [];
      if (userId) rooms.push(`user:${userId}`);
      if (sessionId) rooms.push(`session:${sessionId}`);
      
      rooms.forEach(room => {
        io.to(room).emit('agent_status', {
          agentId,
          status,
          timestamp: new Date().toISOString(),
        });
      });

      logger.info('Agent status broadcasted', { agentId, status });
    } catch (error) {
      logger.error('Failed to broadcast agent status', error);
    }
  });

  // Handle real-time typing indicators
  socket.on('typing_start', (data) => {
    try {
      const { sessionId, userId } = data;
      
      // Broadcast to session (excluding sender)
      socket.to(`session:${sessionId}`).emit('user_typing', {
        userId,
        typing: true,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('Failed to broadcast typing indicator', error);
    }
  });

  socket.on('typing_stop', (data) => {
    try {
      const { sessionId, userId } = data;
      
      // Broadcast to session (excluding sender)
      socket.to(`session:${sessionId}`).emit('user_typing', {
        userId,
        typing: false,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('Failed to broadcast typing indicator', error);
    }
  });

  // Handle ping for connection health check
  socket.on('ping', () => {
    socket.emit('pong', {
      timestamp: new Date().toISOString(),
    });
  });

  // Handle disconnection
  socket.on('disconnect', (reason) => {
    const connection = activeConnections.get(socket.id);
    
    logger.info('Client disconnected', {
      socketId: socket.id,
      connectionId: connection?.id,
      reason,
      duration: connection ? Date.now() - connection.connectedAt.getTime() : 0,
    });

    // Clean up sessions
    if (connection?.sessionId) {
      activeSessions.delete(connection.sessionId);
    }

    // Remove connection
    activeConnections.delete(socket.id);
  });

  // Handle connection errors
  socket.on('error', (error) => {
    logger.error('Socket error', { socketId: socket.id, error });
  });
});

// Health check endpoint
httpServer.on('request', (req, res) => {
  if (req.url === '/health' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      connections: activeConnections.size,
      sessions: activeSessions.size,
      uptime: process.uptime(),
    }));
  }
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  httpServer.close(() => {
    logger.info('HTTP server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  httpServer.close(() => {
    logger.info('HTTP server closed');
    process.exit(0);
  });
});

// Start server
httpServer.listen(PORT, HOST, () => {
  logger.info(`WebSocket service started on ${HOST}:${PORT}`);
  logger.info(`Health check available at http://${HOST}:${PORT}/health`);
});

// Periodic cleanup
setInterval(() => {
  const now = Date.now();
  const timeout = 30 * 60 * 1000; // 30 minutes

  // Clean up inactive sessions
  for (const [sessionId, session] of activeSessions.entries()) {
    if (now - session.lastActivity.getTime() > timeout) {
      activeSessions.delete(sessionId);
      logger.info('Cleaned up inactive session', { sessionId });
    }
  }
}, 5 * 60 * 1000); // Run every 5 minutes

export default httpServer;
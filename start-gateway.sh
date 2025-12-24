#!/data/data/com.termux/files/usr/bin/bash

# Simple Node.js Gateway for Android Termux
# Alternative to Caddy for port routing

set -e

echo "🌐 Starting Node.js Gateway for Android"
echo "====================================="

# Configuration
MAIN_PORT=3000
WEBSOCKET_PORT=3003
GATEWAY_PORT=81

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if required ports are available
check_port() {
    local port=$1
    if lsof -i :$port > /dev/null 2>&1; then
        print_error "Port $port is already in use"
        return 1
    fi
    return 0
}

# Check ports
print_status "Checking port availability..."
check_port $GATEWAY_PORT || exit 1
check_port $MAIN_PORT || exit 1
check_port $WEBSOCKET_PORT || exit 1

# Create gateway server
print_status "Creating Node.js gateway server..."

cat > gateway-server.js << 'EOF'
const http = require('http');
const url = require('url');

const MAIN_PORT = 3000;
const WEBSOCKET_PORT = 3003;
const GATEWAY_PORT = 81;

// Request handler
const handler = (req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const query = parsedUrl.query;
    
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }
    
    // Handle XTransformPort query parameter
    if (query.XTransformPort) {
        const targetPort = query.XTransformPort;
        console.log(`Routing to port: ${targetPort}`);
        
        // Proxy to target port
        const proxy = http.request({
            hostname: 'localhost',
            port: targetPort,
            path: parsedUrl.pathname,
            method: req.method,
            headers: req.headers
        }, (proxyRes) => {
            res.writeHead(proxyRes.statusCode, proxyRes.headers);
            proxyRes.pipe(res);
        });
        
        proxy.on('error', (err) => {
            console.error('Proxy error:', err);
            res.writeHead(502);
            res.end('Bad Gateway');
        });
        
        req.pipe(proxy);
        return;
    }
    
    // Default: route to main application
    console.log(`Routing to main app on port: ${MAIN_PORT}`);
    
    const proxy = http.request({
        hostname: 'localhost',
        port: MAIN_PORT,
        path: parsedUrl.pathname,
        method: req.method,
        headers: req.headers
    }, (proxyRes) => {
        res.writeHead(proxyRes.statusCode, proxyRes.headers);
            proxyRes.pipe(res);
        });
        
        proxy.on('error', (err) => {
            console.error('Proxy error:', err);
            res.writeHead(502);
            res.end('Bad Gateway');
        });
        
        req.pipe(proxy);
};

// Create server
const server = http.createServer(handler);

server.listen(GATEWAY_PORT, () => {
    console.log(`🌐 Gateway running on port ${GATEWAY_PORT}`);
    console.log(`📱 Main app: http://localhost:${MAIN_PORT}`);
    console.log(`🔌 WebSocket: http://localhost:${WEBSOCKET_PORT}`);
    console.log(`🌍 External access: http://localhost:${GATEWAY_PORT}`);
    console.log('');
    console.log('Routing examples:');
    console.log(`  Main app: http://localhost:${GATEWAY_PORT}/`);
    console.log(`  WebSocket: http://localhost:${GATEWAY_PORT}/?XTransformPort=${WEBSOCKET_PORT}`);
    console.log('');
});

// Handle errors
server.on('error', (err) => {
    console.error('Server error:', err);
    process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('🛑 Received SIGTERM, shutting down gracefully...');
    server.close(() => {
        console.log('✅ Gateway server closed');
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    console.log('🛑 Received SIGINT, shutting down gracefully...');
    server.close(() => {
        console.log('✅ Gateway server closed');
        process.exit(0);
    });
});
EOF

print_status "Starting gateway server..."
node gateway-server.js &
GATEWAY_PID=$!

print_status "Gateway started with PID: $GATEWAY_PID"
print_status "Access your app at: http://localhost:$GATEWAY_PORT"

# Save PID for cleanup
echo $GATEWAY_PID > /tmp/gateway.pid

print_status "✅ Node.js Gateway started successfully!"
echo ""
echo "📱 Usage:"
echo "  Main app: http://localhost:$GATEWAY_PORT"
echo "  WebSocket: http://localhost:$GATEWAY_PORT/?XTransformPort=$WEBSOCKET_PORT"
echo ""
echo "🛑 To stop: kill $GATEWAY_PID"
echo "           or: kill \$(cat /tmp/gateway.pid)"
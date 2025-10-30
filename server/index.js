const express = require('express');
const http = require('http');
const path = require('path');
const { Server } = require('ws');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, '../dist')));

// CORS middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  next();
});

// Initialize WebSocket server with path
const wss = new Server({
  noServer: true, // We'll handle the upgrade manually
  clientTracking: true,
  maxPayload: 100 * 1024 * 1024, // 100MB max payload
  path: '/ws' // Handle WebSocket connections on /ws path
});

// Create HTTP server
const server = http.createServer(app);

// Add debug logging for WebSocket upgrade requests
server.on('upgrade', (request, socket, head) => {
  console.log('WebSocket upgrade request:', {
    url: request.url,
    headers: request.headers,
    remoteAddress: socket.remoteAddress,
    remotePort: socket.remotePort
  });
  
  // Handle the WebSocket upgrade
  wss.handleUpgrade(request, socket, head, (ws) => {
    wss.emit('connection', ws, request);
  });
});

// Store connected clients
const clients = new Map();

// WebSocket connection handler with heartbeat
wss.on('connection', (ws, req) => {
  const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  const connectionId = Math.random().toString(36).substr(2, 9);
  
  console.log(`[${new Date().toISOString()}] [${connectionId}] New WebSocket connection from ${clientIp}`, {
    url: req.url,
    headers: req.headers,
    protocol: ws.protocol
  });
  
  let userId = null;
  let userRole = null;
  let isAlive = true;
  let authenticated = false;
  
  // Heartbeat function
  const heartbeat = () => {
    isAlive = true;
  };
  
  // Set up heartbeat interval (30 seconds)
  const heartbeatInterval = setInterval(() => {
    if (!isAlive) {
      console.log(`Terminating connection to ${userId || 'unauthenticated client'} (no heartbeat)`);
      ws.terminate();
      return;
    }
    
    isAlive = false;
    try {
      if (ws.readyState === ws.OPEN) {
        ws.ping();
      }
    } catch (error) {
      console.error('Error sending ping:', error);
    }
  }, 30000);
  
  // Handle pong responses
  ws.on('pong', heartbeat);
  
  // Handle incoming messages
  ws.on('message', (message) => {
    try {
      console.log(`[${new Date().toISOString()}] [${connectionId}] Received message from ${userId || 'unauthenticated'}:`, message);
      
      let data;
      try {
        data = JSON.parse(message);
      } catch (parseError) {
        console.error(`[${connectionId}] Invalid JSON message:`, message);
        ws.send(JSON.stringify({
          type: 'ERROR',
          error: 'Invalid JSON message',
          timestamp: new Date().toISOString()
        }));
        return;
      }
      
      // Handle authentication
      if (data.type === 'AUTH' && data.userId) {
        userId = data.userId;
        userRole = data.role || 'unknown';
        authenticated = true;
        clients.set(userId, { ws, role: userRole });
        
        console.log(`[${new Date().toISOString()}] [${connectionId}] User ${userId} (${userRole}) authenticated from ${clientIp}`);
        
        // Send welcome message
        ws.send(JSON.stringify({
          type: 'AUTH_SUCCESS',
          message: 'Successfully connected to WebSocket server',
          userId,
          role: userRole,
          timestamp: new Date().toISOString(),
          serverTime: new Date().toISOString()
        }));
      } else if (!authenticated) {
        // Reject unauthenticated messages
        console.warn(`[${connectionId}] Rejecting unauthenticated message type: ${data.type}`);
        ws.send(JSON.stringify({
          type: 'ERROR',
          error: 'Authentication required',
          timestamp: new Date().toISOString()
        }));
        ws.close(1008, 'Authentication required');
      } else {
        // Handle other message types here if needed
        console.log(`[${connectionId}] [${userId}] Received message type: ${data.type}`, data);
      }
    } catch (error) {
      console.error(`[${connectionId}] Error processing WebSocket message:`, error);
      try {
        ws.send(JSON.stringify({
          type: 'ERROR',
          error: 'Internal server error',
          message: error.message,
          timestamp: new Date().toISOString()
        }));
      } catch (sendError) {
        console.error(`[${connectionId}] Failed to send error response:`, sendError);
      }
    }
  });

  // Handle client disconnection
  ws.on('close', (code, reason) => {
    clearInterval(heartbeatInterval);
    
    const disconnectInfo = {
      connectionId,
      clientIp,
      userId,
      userRole,
      code,
      reason: reason.toString()
    };
    
    if (userId) {
      clients.delete(userId);
      console.log(`[${new Date().toISOString()}] [${connectionId}] User ${userId} (${userRole}) disconnected:`, disconnectInfo);
    } else {
      console.log(`[${new Date().toISOString()}] [${connectionId}] Unauthenticated client disconnected:`, disconnectInfo);
    }
    
    // Clean up any resources
    if (ws.readyState === ws.OPEN) {
      try {
        ws.terminate();
      } catch (e) {
        console.error(`[${connectionId}] Error terminating WebSocket:`, e);
      }
    }
  });

  // Handle errors
  ws.on('error', (error) => {
    console.error(`[${new Date().toISOString()}] [${connectionId}] WebSocket error for ${userId || 'unauthenticated'}:`, {
      error: error.message,
      stack: error.stack,
      clientIp,
      userId,
      userRole
    });
  });
  
  // Send initial connection message
  ws.send(JSON.stringify({
    type: 'CONNECTION_ESTABLISHED',
    connectionId,
    timestamp: new Date().toISOString(),
    message: 'WebSocket connection established. Please authenticate.'
  }));
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', clients: clients.size });
});

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../dist')));
  
  // Handle SPA routing
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../dist/index.html'));
  });
}

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`WebSocket server running on ws://localhost:${PORT}`);
});

// Export for testing
module.exports = { server, wss };

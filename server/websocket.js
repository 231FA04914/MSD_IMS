const WebSocket = require('ws');
const http = require('http');

// Create HTTP server for WebSocket with CORS support
const server = http.createServer((req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Request-Method', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
  res.setHeader('Access-Control-Allow-Headers', '*');
  
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }
  
  // Handle other requests
  res.writeHead(404);
  res.end();
});

const wss = new WebSocket.Server({ 
  server,
  clientTracking: true,
  // Increase the maximum payload size to 100MB
  maxPayload: 100 * 1024 * 1024
});

// Store connected clients
const clients = new Map();

// Handle new WebSocket connections
wss.on('connection', (ws, req) => {
  const clientIp = req.socket.remoteAddress;
  console.log(`New WebSocket connection from ${clientIp}`);
  
  let userId = null;
  let userRole = null;
  let isAlive = true;
  
  // Set up heartbeat
  const heartbeat = () => {
    isAlive = true;
  };
  
  const heartbeatInterval = setInterval(() => {
    if (!isAlive) {
      console.log(`Terminating connection to ${userId || 'unauthenticated client'} (no heartbeat)`);
      ws.terminate();
      return;
    }
    
    isAlive = false;
    try {
      if (ws.readyState === WebSocket.OPEN) {
        ws.ping();
      }
    } catch (error) {
      console.error('Error sending ping:', error);
    }
  }, 30000); // 30 seconds
  
  ws.on('pong', heartbeat);

  // Handle incoming messages
  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      
      // Handle authentication
      if (data.type === 'AUTH' && data.userId) {
        userId = data.userId;
        userRole = data.role;
        clients.set(userId, { ws, role: userRole });
        console.log(`User ${userId} (${userRole}) connected`);
      }
    } catch (error) {
      console.error('Error processing WebSocket message:', error);
    }
  });

  // Handle client disconnection
  ws.on('close', (code, reason) => {
    clearInterval(heartbeatInterval);
    if (userId) {
      clients.delete(userId);
      console.log(`User ${userId} (${userRole}) disconnected. Code: ${code}, Reason: ${reason || 'No reason provided'}`);
    } else {
      console.log(`Unauthenticated client disconnected. Code: ${code}, Reason: ${reason || 'No reason provided'}`);
    }
  });
  
  // Handle errors
  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
    try {
      // Try to close the connection cleanly
      if (ws.readyState === WebSocket.OPEN) {
        ws.close(4000, 'WebSocket error occurred');
      }
    } catch (e) {
      console.error('Error closing WebSocket after error:', e);
    }
  });
});

// Function to broadcast updates to all connected clients
function broadcastUpdate(type, data) {
  const message = JSON.stringify({ type, ...data });
  clients.forEach(({ ws }) => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(message);
    }
  });
}

// Function to notify specific user
function notifyUser(userId, type, data) {
  const client = clients.get(userId);
  if (client && client.ws.readyState === WebSocket.OPEN) {
    client.ws.send(JSON.stringify({ type, ...data }));
  }
}

// Start the server
const PORT = process.env.WS_PORT || 3001;
server.listen(PORT, () => {
  console.log(`WebSocket server running on port ${PORT}`);
});

module.exports = {
  broadcastUpdate,
  notifyUser
};

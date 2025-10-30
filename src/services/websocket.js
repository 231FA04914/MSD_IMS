class WebSocketService {
  constructor() {
    this.socket = null;
    this.callbacks = [];
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 10;
    this.reconnectDelay = 2000;
    this.isConnected = false;
    this.isAuthenticated = false;
    this.messageQueue = [];
    this.reconnectTimeout = null;
    this.wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    this.wsUrl = `${this.wsProtocol}//${window.location.hostname}:3001`;
    
    // Bind methods
    this.connect = this.connect.bind(this);
    this.disconnect = this.disconnect.bind(this);
    this.handleReconnect = this.handleReconnect.bind(this);
    this.authenticate = this.authenticate.bind(this);
    this.processMessageQueue = this.processMessageQueue.bind(this);
    this.send = this.send.bind(this);
    this.subscribe = this.subscribe.bind(this);
  }

  connect() {
    // Clear any existing connection attempts
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    // Don't try to reconnect if we're already connected
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      console.log('WebSocket already connected, skipping new connection');
      this.isConnected = true;
      return;
    }
    
    // Check max reconnection attempts
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.warn(`Max WebSocket reconnection attempts reached. WebSocket features disabled.`);
      return;
    }

    try {
      console.log(`Attempting to connect to WebSocket at ${this.wsUrl} (attempt ${this.reconnectAttempts + 1}/${this.maxReconnectAttempts})`);
      
      // Add timeout for connection attempt
      const connectionTimeout = setTimeout(() => {
        if (this.socket && this.socket.readyState === WebSocket.CONNECTING) {
          console.warn('WebSocket connection timeout, closing connection');
          this.socket.close();
        }
      }, 5000); // 5 second timeout
      
      this.socket = new WebSocket(this.wsUrl);
      this.isConnected = false;
      this.isAuthenticated = false;

      // Clear timeout when connection opens
      this.socket.addEventListener('open', () => {
        clearTimeout(connectionTimeout);
      }, { once: true });

      // Set up event handlers
      this.setupEventHandlers();
    } catch (error) {
      console.warn('WebSocket connection failed, continuing without real-time features:', error);
      // Don't attempt reconnection on initial failure to prevent blocking
      this.reconnectAttempts = this.maxReconnectAttempts;
    }
  }

  setupEventHandlers() {
    if (!this.socket) return;

    this.socket.onopen = () => {
      console.log('WebSocket connected successfully');
      this.isConnected = true;
      this.reconnectAttempts = 0;
      this.reconnectDelay = 2000; // Reset delay to 2 seconds
      
      // Process any queued messages
      this.processMessageQueue();
      
      // Send authentication if user is logged in
      this.authenticate();
    };

    this.socket.onmessage = (event) => {
      try {
        const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
        console.debug('WebSocket message received:', data);
        
        // Handle connection established message
        if (data.type === 'CONNECTION_ESTABLISHED') {
          console.log('WebSocket connection established, authenticating...');
          this.authenticate();
          return;
        }
        
        // Handle auth success
        if (data.type === 'AUTH_SUCCESS') {
          console.log('WebSocket authentication successful:', data);
          this.isAuthenticated = true;
        }
        
        // Forward all messages to subscribers
        this.callbacks.forEach(callback => callback(data));
      } catch (error) {
        console.error('Error processing WebSocket message:', error, 'Raw data:', event.data);
      }
    };

    this.socket.onclose = (event) => {
      console.log(`WebSocket disconnected. Code: ${event.code}, Reason: ${event.reason || 'No reason provided'}`);
      this.isConnected = false;
      this.isAuthenticated = false;
      
      // Don't try to reconnect if this was a clean disconnect
      if (event.code === 1000) {
        console.log('WebSocket closed cleanly');
        return;
      }
      
      this.handleReconnect();
    };

    this.socket.onerror = (error) => {
      console.error('WebSocket error:', error);
      // Close the socket to trigger onclose handler with a valid close code
      if (this.socket) {
        try {
          // Use a valid close code (1000 for normal closure or 4000-4999 for application-specific codes)
          this.socket.close(4000, 'WebSocket error occurred');
        } catch (e) {
          console.error('Error closing WebSocket:', e);
          this.isConnected = false;
          this.isAuthenticated = false;
          this.handleReconnect();
        }
      } else {
        this.isConnected = false;
        this.isAuthenticated = false;
        this.handleReconnect();
      }
    };
  }

  authenticate() {
    if (!this.isConnected || !this.socket) {
      console.warn('Cannot authenticate: WebSocket not connected');
      return false;
    }

    const userData = localStorage.getItem('inventoryUser');
    if (!userData) {
      console.log('No user data found for WebSocket authentication');
      return false;
    }

    try {
      const { id, role } = JSON.parse(userData);
      if (id && role) {
        console.log('Sending WebSocket authentication for user:', { id, role });
        return this.send({
          type: 'AUTH',
          userId: id,
          role: role,
          timestamp: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error('Error parsing user data for WebSocket auth:', error);
    }
    return false;
  }

  handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = Math.min(this.reconnectDelay * Math.pow(2, this.reconnectAttempts), 30000); // Max 30s delay
      
      console.log(`Attempting to reconnect in ${delay/1000} seconds... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      
      this.reconnectTimeout = setTimeout(() => {
        this.connect();
      }, delay);
    } else {
      console.error('Max reconnection attempts reached. Please refresh the page to try again.');
    }
  }

  disconnect() {
    // Clear any pending reconnection attempts
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    if (this.socket) {
      try {
        // Use a valid close code (1000 for normal closure)
        this.socket.close(1000, 'Client disconnected');
      } catch (error) {
        console.error('Error closing WebSocket:', error);
      } finally {
        this.socket = null;
        this.isConnected = false;
        this.isAuthenticated = false;
      }
    }
  }

  processMessageQueue() {
    if (!this.messageQueue.length || !this.isConnected) return;

    console.log(`Processing ${this.messageQueue.length} queued messages...`);
    
    // Create a copy of the queue and clear it
    const messagesToSend = [...this.messageQueue];
    this.messageQueue = [];
    
    // Send each message
    messagesToSend.forEach(message => this.send(message));
  }

  send(data) {
    // If not connected, queue the message
    if (!this.isConnected || !this.socket || this.socket.readyState !== WebSocket.OPEN) {
      console.log('WebSocket not connected, queuing message:', data);
      this.messageQueue.push(data);
      
      // Try to reconnect if not already attempting to
      if (!this.reconnectTimeout) {
        this.connect();
      }
      return false;
    }

    try {
      const message = typeof data === 'string' ? data : JSON.stringify(data);
      this.socket.send(message);
      return true;
    } catch (error) {
      console.error('Error sending WebSocket message:', error);
      this.messageQueue.push(data); // Re-queue the message on error
      return false;
    }
  }

  subscribe(callback) {
    if (typeof callback !== 'function') {
      console.error('Callback must be a function');
      return () => {}; // Return empty cleanup function
    }

    // Add callback to the list
    this.callbacks.push(callback);

    // Return cleanup function to unsubscribe
    return () => {
      this.callbacks = this.callbacks.filter(cb => cb !== callback);
    };
  }

  // Add message handler (alias for subscribe for backward compatibility)
  addMessageHandler(callback) {
    return this.subscribe(callback);
  }

  // Remove message handler
  removeMessageHandler(callback) {
    this.callbacks = this.callbacks.filter(cb => cb !== callback);
  }
}

// Create and export a singleton instance
export const webSocketService = new WebSocketService();

// Auto-connect disabled to prevent blocking the app
// WebSocket is optional and should not prevent the app from loading
if (typeof window !== 'undefined') {
  // Only attempt connection if explicitly enabled
  const enableWebSocket = localStorage.getItem('enableWebSocket') === 'true';
  
  if (enableWebSocket) {
    // In browser environment, connect after a delay to allow app to initialize
    setTimeout(() => {
      try {
        webSocketService.connect();
      } catch (error) {
        console.warn('WebSocket connection failed, continuing without real-time features:', error);
      }
    }, 5000); // Increased delay to ensure app loads first
  }
}

export default webSocketService;

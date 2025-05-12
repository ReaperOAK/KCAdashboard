class WebSocketService {
  static instance = null;
  static websocket = null;
  static callbacks = {
    notification: [],
    chat_message: [],
    typing: [],
    stopped_typing: []
  };
  static reconnectAttempts = 0;
  static maxReconnectAttempts = 5;
  static reconnectTimeout = null;

  constructor() {
    if (WebSocketService.instance) {
      return WebSocketService.instance;
    }
    
    WebSocketService.instance = this;
    this.connect();
    
    // Handle page visibility changes (reconnect when tab becomes visible)
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible' && !this.isConnected()) {
        this.connect();
      }
    });
    
    // Handle window online/offline events
    window.addEventListener('online', () => {
      if (!this.isConnected()) {
        this.connect();
      }
    });
  }

  /**
   * Connect to the WebSocket server
   */
  connect() {
    if (WebSocketService.websocket && 
        (WebSocketService.websocket.readyState === WebSocket.OPEN || 
         WebSocketService.websocket.readyState === WebSocket.CONNECTING)) {
      return;
    }
    
    try {
      // Get authentication token
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('No auth token available, not connecting to WebSocket');
        return;
      }
      
      // Create WebSocket connection
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const host = process.env.REACT_APP_WEBSOCKET_HOST || window.location.hostname;
      const port = process.env.REACT_APP_WEBSOCKET_PORT || '8080';
      const wsUrl = `${protocol}//${host}:${port}`;
      
      WebSocketService.websocket = new WebSocket(wsUrl);
      
      // Set up event handlers
      WebSocketService.websocket.onopen = () => {
        console.log('WebSocket connection established');
        WebSocketService.reconnectAttempts = 0;
        
        // Send authentication message
        this.sendMessage({
          type: 'auth',
          token
        });
      };
      
      WebSocketService.websocket.onmessage = (event) => {
        this.handleMessage(event);
      };
      
      WebSocketService.websocket.onclose = (event) => {
        console.log('WebSocket connection closed:', event.code, event.reason);
        if (WebSocketService.reconnectAttempts < WebSocketService.maxReconnectAttempts) {
          // Reconnect with exponential backoff
          const delay = Math.pow(2, WebSocketService.reconnectAttempts) * 1000;
          console.log(`Attempting to reconnect in ${delay}ms...`);
          
          clearTimeout(WebSocketService.reconnectTimeout);
          WebSocketService.reconnectTimeout = setTimeout(() => {
            WebSocketService.reconnectAttempts++;
            this.connect();
          }, delay);
        }
      };
      
      WebSocketService.websocket.onerror = (error) => {
        console.error('WebSocket error:', error);
      };
      
    } catch (error) {
      console.error('Error connecting to WebSocket:', error);
    }
  }
  
  /**
   * Close the WebSocket connection
   */
  disconnect() {
    if (WebSocketService.websocket) {
      WebSocketService.websocket.close();
      WebSocketService.websocket = null;
    }
    
    // Clear reconnect timeout
    clearTimeout(WebSocketService.reconnectTimeout);
  }
  
  /**
   * Check if WebSocket is connected
   * @returns {boolean}
   */
  isConnected() {
    return WebSocketService.websocket && WebSocketService.websocket.readyState === WebSocket.OPEN;
  }
  
  /**
   * Handle incoming WebSocket messages
   * @param {MessageEvent} event 
   */
  handleMessage(event) {
    try {
      const data = JSON.parse(event.data);
      
      if (!data || !data.type) {
        console.warn('Invalid WebSocket message format:', data);
        return;
      }
      
      console.log('WebSocket message received:', data.type);
      
      // Invoke all registered callbacks for this message type
      const callbacks = WebSocketService.callbacks[data.type] || [];
      callbacks.forEach(callback => {
        try {
          callback(data);
        } catch (callbackError) {
          console.error('Error in WebSocket callback:', callbackError);
        }
      });
      
    } catch (error) {
      console.error('Error parsing WebSocket message:', error);
    }
  }
  
  /**
   * Send a message to the WebSocket server
   * @param {object} data 
   */
  sendMessage(data) {
    if (!this.isConnected()) {
      console.warn('WebSocket is not connected, reconnecting...');
      this.connect();
      
      // Queue the message to be sent when connection is established
      setTimeout(() => {
        if (this.isConnected()) {
          this.sendMessage(data);
        }
      }, 1000);
      return;
    }
    
    WebSocketService.websocket.send(JSON.stringify(data));
  }
  
  /**
   * Register a callback for a specific message type
   * @param {string} type - Message type (e.g., 'notification', 'chat_message')
   * @param {function} callback - Callback function to be called when a message of this type is received
   * @returns {function} - Function to unregister the callback
   */
  on(type, callback) {
    if (!WebSocketService.callbacks[type]) {
      WebSocketService.callbacks[type] = [];
    }
    
    WebSocketService.callbacks[type].push(callback);
    
    // Return a function to remove this callback
    return () => {
      WebSocketService.callbacks[type] = WebSocketService.callbacks[type].filter(
        cb => cb !== callback
      );
    };
  }
  
  /**
   * Remove all callbacks for a specific message type
   * @param {string} type 
   */
  off(type) {
    WebSocketService.callbacks[type] = [];
  }
  
  /**
   * Send a chat message
   * @param {number} conversationId 
   * @param {object} messageData 
   */
  sendChatMessage(conversationId, messageData) {
    this.sendMessage({
      type: 'chat_message',
      conversation_id: conversationId,
      message: messageData
    });
  }
  
  /**
   * Send typing indicator
   * @param {number} conversationId 
   * @param {number} userId 
   */
  sendTyping(conversationId, userId) {
    this.sendMessage({
      type: 'typing',
      conversation_id: conversationId,
      user_id: userId
    });
  }
  
  /**
   * Send stopped typing indicator
   * @param {number} conversationId 
   * @param {number} userId 
   */
  sendStoppedTyping(conversationId, userId) {
    this.sendMessage({
      type: 'stopped_typing',
      conversation_id: conversationId,
      user_id: userId
    });
  }
}

// Create and export a singleton instance
const websocketService = new WebSocketService();
export default websocketService;
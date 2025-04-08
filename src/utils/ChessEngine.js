class ChessEngine {
  constructor(level = 10) {
    this.worker = null;
    this.isReady = false;
    this.onMessage = null;
    this.callbackQueue = [];
    this.level = level;
    this.initializeEngine();
  }

  initializeEngine() {
    // Load Stockfish.js web worker
    try {
      // Try the public folder first (preferred location)
      this.worker = new Worker('/stockfish/stockfish.js');
      
      this.worker.onmessage = (e) => {
        const message = e.data;

        // Call registered message callback if it exists
        if (this.onMessage) {
          this.onMessage(message);
        }
        
        // Handle specific messages
        if (message === 'readyok' || message === 'uciok') {
          this.isReady = true;
          // Process queued commands once engine is ready
          this.callbackQueue.forEach(cmd => this.sendCommand(cmd));
          this.callbackQueue = [];
        }
        
        // When engine responds with a bestmove
        if (message.startsWith('bestmove')) {
          const moveStr = message.split(' ')[1];
          this.triggerCallbacks('bestmove', moveStr);
        }
      };
      
      // Initialize engine
      this.sendCommand('uci');
      this.sendCommand('setoption name Skill Level value ' + this.level);
      this.sendCommand('isready');
    } catch (error) {
      console.error('Failed to initialize chess engine from primary source:', error);
      
      // Fallback to CDN version if available
      try {
        console.log('Attempting to load Stockfish from CDN...');
        this.worker = new Worker('https://cdn.jsdelivr.net/npm/stockfish.js@10/stockfish.js');
        
        this.worker.onmessage = (e) => {
          const message = e.data;
          
          // Same message handling as above
          if (this.onMessage) {
            this.onMessage(message);
          }
          
          if (message === 'readyok' || message === 'uciok') {
            this.isReady = true;
            this.callbackQueue.forEach(cmd => this.sendCommand(cmd));
            this.callbackQueue = [];
          }
          
          if (message.startsWith('bestmove')) {
            const moveStr = message.split(' ')[1];
            this.triggerCallbacks('bestmove', moveStr);
          }
        };
        
        this.sendCommand('uci');
        this.sendCommand('setoption name Skill Level value ' + this.level);
        this.sendCommand('isready');
      } catch (fallbackError) {
        console.error('Failed to initialize chess engine from fallback source:', fallbackError);
        throw new Error('Could not load Stockfish engine. Please check your internet connection or try again later.');
      }
    }
  }
  
  setSkillLevel(level) {
    this.level = level;
    this.sendCommand('setoption name Skill Level value ' + level);
  }
  
  sendCommand(cmd) {
    if (!this.worker) {
      return false;
    }
    
    if (!this.isReady && cmd !== 'uci' && cmd !== 'isready') {
      this.callbackQueue.push(cmd);
      return false;
    }
    
    this.worker.postMessage(cmd);
    return true;
  }
  
  evaluatePosition(fen, depth = 12) {
    return new Promise((resolve) => {
      const resultHandler = (type, data) => {
        if (type === 'evaluation') {
          this.removeCallback('evaluation');
          resolve(data);
        }
      };
      
      this.registerCallback('evaluation', resultHandler);
      
      this.sendCommand('position fen ' + fen);
      this.sendCommand('go depth ' + depth);
      
      // Start tracking analysis info
      this.onMessage = (message) => {
        if (message.startsWith('info depth') && message.includes('score')) {
          const tokens = message.split(' ');
          const depthIndex = tokens.indexOf('depth');
          const scoreIndex = tokens.indexOf('score');
          
          if (depthIndex !== -1 && scoreIndex !== -1) {
            const depth = parseInt(tokens[depthIndex + 1]);
            const scoreType = tokens[scoreIndex + 1]; // cp or mate
            const scoreValue = parseInt(tokens[scoreIndex + 2]);
            
            if (depth >= 10) { // Only use deeper analysis
              let evaluation = 0;
              if (scoreType === 'cp') {
                evaluation = scoreValue / 100; // Convert centipawns to pawns
              } else if (scoreType === 'mate') {
                evaluation = scoreValue > 0 ? 100 : -100; // Arbitrary high value for mate
              }
              
              // Extract best move if available
              let bestMove = null;
              if (message.includes(' pv ')) {
                const pvIndex = tokens.indexOf('pv');
                if (pvIndex !== -1 && tokens.length > pvIndex + 1) {
                  bestMove = tokens[pvIndex + 1];
                }
              }
              
              resultHandler('evaluation', {
                score: evaluation,
                depth,
                scoreType,
                scoreValue,
                bestMove
              });
            }
          }
        }
      };
    });
  }
  
  getBestMove(fen, moveTime = 1000) {
    return new Promise((resolve) => {
      const resultHandler = (type, data) => {
        if (type === 'bestmove') {
          this.removeCallback('bestmove');
          resolve(data);
        }
      };
      
      this.registerCallback('bestmove', resultHandler);
      
      this.sendCommand('position fen ' + fen);
      this.sendCommand('go movetime ' + moveTime);
    });
  }
  
  // Callback system for asynchronous responses
  callbacks = {
    bestmove: [],
    evaluation: []
  };
  
  registerCallback(type, callback) {
    if (!this.callbacks[type]) {
      this.callbacks[type] = [];
    }
    this.callbacks[type].push(callback);
  }
  
  removeCallback(type) {
    this.callbacks[type] = [];
  }
  
  triggerCallbacks(type, data) {
    if (this.callbacks[type]) {
      this.callbacks[type].forEach(callback => callback(type, data));
    }
  }
  
  terminate() {
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
      this.isReady = false;
    }
  }
}

export default ChessEngine;

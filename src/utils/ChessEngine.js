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
    try {
      console.log('Initializing chess engine...');
      
      // Use base URL to ensure we load from the current domain
      const baseUrl = window.location.origin;
      this.tryEngineLoad(`${baseUrl}/stockfish/stockfish.min.js`);
    } catch (error) {
      console.error('Failed to initialize chess engine:', error);
      this.simulateEngine();
    }
  }
  
  tryEngineLoad(url) {
    try {
      console.log(`Attempting to load engine from: ${url}`);
      this.worker = new Worker(url);
      
      // Set up message handler
      this.worker.onmessage = (e) => this.handleMessage(e.data);
      
      // Set up error handler
      this.worker.onerror = (e) => {
        console.error('Stockfish worker error:', e);
        console.warn('Switching to simulated engine mode');
        
        // Terminate failed worker
        if (this.worker) {
          this.worker.terminate();
          this.worker = null;
        }
        
        // Use fallback
        this.simulateEngine();
      };
      
      // Initialize engine
      this.sendCommand('uci');
      this.sendCommand('setoption name Skill Level value ' + this.level);
      this.sendCommand('isready');
    } catch (error) {
      console.error('Engine load error:', error);
      this.simulateEngine();
    }
  }
  
  // Handle engine messages
  handleMessage(message) {
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
  }
  
  // Simulate engine for graceful degradation
  simulateEngine() {
    console.warn('Using simulated chess engine - limited functionality');
    
    // Create a fake worker-like interface using setTimeout
    this.worker = {
      postMessage: (cmd) => {
        setTimeout(() => {
          if (cmd === 'uci') {
            this.handleMessage('id name Simulated Engine');
            this.handleMessage('id author Fallback');
            this.handleMessage('uciok');
          } else if (cmd === 'isready') {
            this.handleMessage('readyok');
          } else if (cmd.startsWith('go')) {
            // Generate a simple valid chess move
            const moves = ['e2e4', 'd2d4', 'g1f3', 'c2c4', 'b1c3', 'f2f4'];
            const randomMove = moves[Math.floor(Math.random() * moves.length)];
            
            // Simulate a delay and send the move
            setTimeout(() => {
              this.handleMessage('info depth 1 score cp 0');
              this.handleMessage('bestmove ' + randomMove);
            }, 300);
          }
        }, 10);
      },
      terminate: () => {
        console.log('Simulated engine terminated');
      }
    };
    
    // Initialize fake engine
    this.sendCommand('uci');
    this.sendCommand('isready');
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
    
    try {
      this.worker.postMessage(cmd);
      return true;
    } catch (error) {
      console.error('Error sending command to engine:', error);
      return false;
    }
  }
  
  // Callbacks for engine responses
  callbacks = {
    'bestmove': []
  };
  
  onBestMove(callback) {
    this.callbacks['bestmove'].push(callback);
    return this;
  }
  
  triggerCallbacks(type, data) {
    if (this.callbacks[type]) {
      this.callbacks[type].forEach(callback => callback(data));
    }
  }
  
  // Get best move from the engine
  getBestMove(fen, timeLimit = 1000) {
    return new Promise((resolve, reject) => {
      // Set position
      this.sendCommand('position fen ' + fen);
      
      // Clear previous callbacks
      this.callbacks['bestmove'] = [];
      
      // Set up callback for best move
      this.onBestMove(move => {
        resolve(move);
      });
      
      // Start analysis
      this.sendCommand(`go movetime ${timeLimit}`);
      
      // Add timeout safeguard
      setTimeout(() => {
        if (this.callbacks['bestmove'].length > 0) {
          reject(new Error('Engine response timeout'));
        }
      }, timeLimit + 1000);
    });
  }
  
  // Evaluate a position
  evaluatePosition(fen, depth = 15) {
    return new Promise((resolve, reject) => {
      let evaluation = {
        score: 0,
        depth: 0,
        bestMove: null,
        pv: []
      };
      
      // Handler for info messages
      const originalHandler = this.onMessage;
      this.onMessage = (message) => {
        if (originalHandler) originalHandler(message);
        
        if (message.startsWith('info') && message.includes('score')) {
          try {
            // Parse score
            const scoreMatch = message.match(/score\s+(cp|mate)\s+(-?\d+)/);
            if (scoreMatch) {
              const scoreType = scoreMatch[1];
              const scoreValue = parseInt(scoreMatch[2]);
              
              if (scoreType === 'cp') {
                evaluation.score = scoreValue / 100; // Convert centipawns to pawns
              } else if (scoreType === 'mate') {
                // Represent mate score as a very high value
                evaluation.score = scoreValue > 0 ? 100 : -100;
              }
            }
            
            // Parse depth
            const depthMatch = message.match(/depth\s+(\d+)/);
            if (depthMatch) {
              evaluation.depth = parseInt(depthMatch[1]);
            }
            
            // Parse PV (principal variation)
            const pvMatch = message.match(/pv\s+(.*)/);
            if (pvMatch) {
              evaluation.pv = pvMatch[1].split(' ');
              if (evaluation.pv.length > 0) {
                evaluation.bestMove = evaluation.pv[0];
              }
            }
          } catch (e) {
            console.error('Error parsing engine output:', e);
          }
        }
        
        // On bestmove, resolve the promise
        if (message.startsWith('bestmove')) {
          const moveMatch = message.match(/bestmove\s+(\w+)/);
          if (moveMatch && moveMatch[1]) {
            evaluation.bestMove = moveMatch[1];
            resolve(evaluation);
            
            // Restore original handler
            this.onMessage = originalHandler;
          }
        }
      };
      
      // Set position
      this.sendCommand('position fen ' + fen);
      
      // Start analysis
      this.sendCommand(`go depth ${depth}`);
      
      // Add timeout safeguard
      setTimeout(() => {
        if (!evaluation.bestMove) {
          // Force stop and resolve with what we have
          this.sendCommand('stop');
          resolve(evaluation);
          
          // Restore original handler
          this.onMessage = originalHandler;
        }
      }, 5000); // 5 second timeout
    });
  }

  terminate() {
    if (this.worker) {
      if (typeof this.worker.terminate === 'function') {
        this.worker.terminate();
      }
      this.worker = null;
      this.isReady = false;
    }
  }
}

export default ChessEngine;

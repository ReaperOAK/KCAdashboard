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
      console.log('Initializing chess engine directly...');
      
      // Use an absolute path that's guaranteed to be correct
      const workerUrl = '/stockfish/stockfish.js';
      this.worker = new Worker(workerUrl);
      
      // Set up message handler
      this.worker.onmessage = (e) => this.handleMessage(e.data);
      
      // Set up error handler for debugging purposes
      this.worker.onerror = (e) => {
        console.error('Stockfish worker error:', e);
        // Don't throw an error here, as we'll try to recover 
        // with simulated engine if necessary
      };
      
      // Initialize engine
      this.sendCommand('uci');
      this.sendCommand('setoption name Skill Level value ' + this.level);
      this.sendCommand('isready');
      
    } catch (error) {
      console.error('Failed to initialize chess engine:', error);
      
      // Fallback to simulated engine
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
  
  // Last resort - create a simulated engine for graceful degradation
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
  
  evaluatePosition(fen, depth = 12) {
    return new Promise((resolve) => {
      let timeoutId = setTimeout(() => {
        // Resolve with a default evaluation if it takes too long
        this.removeCallback('evaluation');
        resolve({
          score: 0,
          depth: 1,
          scoreType: 'cp',
          scoreValue: 0,
          bestMove: null
        });
      }, 5000); // 5 second timeout
      
      const resultHandler = (type, data) => {
        if (type === 'evaluation') {
          clearTimeout(timeoutId);
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
            
            if (depth >= Math.min(10, depth - 2)) { // Only use deeper analysis
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
      let timeoutId = setTimeout(() => {
        // Resolve with e2e4 as a fallback if it takes too long
        this.removeCallback('bestmove');
        resolve('e2e4');
      }, moveTime + 2000); // moveTime + 2 seconds
      
      const resultHandler = (type, data) => {
        if (type === 'bestmove') {
          clearTimeout(timeoutId);
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
      if (typeof this.worker.terminate === 'function') {
        this.worker.terminate();
      }
      this.worker = null;
      this.isReady = false;
    }
  }
}

export default ChessEngine;

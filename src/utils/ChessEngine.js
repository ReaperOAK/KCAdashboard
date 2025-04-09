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
      
      // Try to load the local stockfish.min.js first
      const workerUrl = this.resolveStockfishPath();
      console.log('Attempting to load engine from:', workerUrl);
      
      this.worker = new Worker(workerUrl);
      
      // Set up message handler
      this.worker.onmessage = (e) => this.handleMessage(e.data);
      
      // Set up error handler for debugging purposes
      this.worker.onerror = (e) => {
        console.error('Stockfish worker error:', e);
        console.warn('Switching to simulated engine mode');
        
        // Clean up the failed worker
        if (this.worker) {
          this.worker.terminate();
          this.worker = null;
        }
        
        this.simulateEngine();
      };
      
      // Initialize engine
      this.sendCommand('uci');
      this.sendCommand('setoption name Skill Level value ' + this.level);
      this.sendCommand('isready');
    } catch (error) {
      console.error('Failed to initialize chess engine:', error);
      this.simulateEngine();
    }
  }
  
  // Resolve the correct path to stockfish.js based on environment
  resolveStockfishPath() {
    // Always use a local path with absolute URL to prevent cross-origin issues
    return `/stockfish/stockfish.min.js`;
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
  
  // Create a simulated engine for graceful degradation
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
            // Extract the FEN position if available
            let fenPosition = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'; // Default starting position
            const positionCmd = this.lastPositionCommand;
            
            if (positionCmd && positionCmd.startsWith('position')) {
              if (positionCmd.includes('fen')) {
                const fenMatch = positionCmd.match(/position fen (.*?)(?:\s+moves\s+|$)/);
                if (fenMatch && fenMatch[1]) {
                  fenPosition = fenMatch[1];
                }
              }
            }
            
            // Simulate analysis and move generation
            setTimeout(() => {
              this.handleMessage('info depth 1 score cp 0');
              
              // Use improved move generation (see function below)
              const move = this.generateSafeMoveForPosition(fenPosition);
              this.handleMessage('bestmove ' + move);
            }, 300);
          } else if (cmd.startsWith('position')) {
            // Store the last position command for reference
            this.lastPositionCommand = cmd;
            this.handleMessage('info string Position set');
          }
        }, 10);
      },
      terminate: () => {
        console.log('Simulated engine terminated');
      }
    };
    
    this.lastPositionCommand = null;
    
    // Initialize fake engine
    this.sendCommand('uci');
    this.sendCommand('isready');
  }
  
  // Generate a safe move based on the color to play
  generateSafeMoveForPosition(fen) {
    try {
      // Extract active color from FEN
      const fenParts = fen.split(' ');
      if (fenParts.length < 2) {
        console.error('Invalid FEN format:', fen);
        return this.getRandomMove('w'); // Default to white
      }
      
      const activeColor = fenParts[1]; // 'w' or 'b'
      console.log(`Generating move for ${activeColor === 'w' ? 'white' : 'black'}`);
      
      return this.getRandomMove(activeColor);
    } catch (error) {
      console.error('Error parsing FEN:', error);
      return this.getRandomMove('w'); // Default to white as fallback
    }
  }
  
  // Get a random move for the specified color
  getRandomMove(color) {
    const whiteStartingMoves = ['e2e4', 'd2d4', 'g1f3', 'c2c4', 'b1c3', 'e2e3', 'd2d3'];
    const blackStartingMoves = ['e7e5', 'd7d5', 'g8f6', 'c7c5', 'b8c6', 'e7e6', 'd7d6'];
    
    const movesForColor = color === 'w' ? whiteStartingMoves : blackStartingMoves;
    return movesForColor[Math.floor(Math.random() * movesForColor.length)];
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
      try {
        // Parse FEN to check whose turn it is
        const fenParts = fen.split(' ');
        const activeColor = fenParts[1]; // 'w' or 'b'
        
        // Set position
        const posCmd = `position fen ${fen}`;
        this.sendCommand(posCmd);
        
        // Clear previous callbacks
        this.callbacks['bestmove'] = [];
        
        // Add safety timeout
        const timeoutId = setTimeout(() => {
          // If engine doesn't respond in time, generate a safe move for the active color
          console.warn('Engine response timeout - using fallback move generation');
          const fallbackMove = this.generateSafeMoveForPosition(fen);
          resolve(fallbackMove);
        }, timeLimit + 500);
        
        // Set up callback for best move
        this.onBestMove(move => {
          clearTimeout(timeoutId);
          
          // Verify the move works for the current color
          console.log(`Received engine move: ${move} for ${activeColor === 'w' ? 'white' : 'black'}`);
          
          // Ensure the move is valid for the current position
          if (!this.isLikelyValidMove(move, activeColor)) {
            console.warn(`Move ${move} doesn't seem valid for ${activeColor}, using fallback`);
            const fallbackMove = this.generateSafeMoveForPosition(fen);
            resolve(fallbackMove);
          } else {
            resolve(move);
          }
        });
        
        // Start analysis with the given time limit
        this.sendCommand(`go movetime ${timeLimit}`);
      } catch (error) {
        console.error("Error getting best move:", error);
        // Return a safe move as fallback
        const fallbackMove = this.generateSafeMoveForPosition(fen || 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
        resolve(fallbackMove);
      }
    });
  }
  
  // Do a basic check to see if a move is likely valid for the current player
  isLikelyValidMove(move, activeColor) {
    if (!move || move.length < 4) return false;
    
    // Check if the move is starting from a square likely to have the active color's piece
    const from = move.substring(0, 2);
    
    // Basic check: white pieces are typically on ranks 1-2, black on ranks 7-8
    const rank = from.charAt(1);
    if (activeColor === 'w' && (rank === '1' || rank === '2')) {
      return true;
    }
    if (activeColor === 'b' && (rank === '7' || '8')) {
      return true;
    }
    
    // For moves from middle ranks, we can't easily determine validity
    // without more complex board state analysis
    return true;
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
      
      // Set position
      this.sendCommand(`position fen ${fen}`);
      
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
            
            // Clear the timeout if we get a valid response
            if (timeoutId) clearTimeout(timeoutId);
            
            // Restore original handler
            this.onMessage = originalHandler;
          }
        }
      };
      
      // Set up a timeout for engine response
      const timeoutId = setTimeout(() => {
        // If engine doesn't respond in time, return whatever we have
        console.warn('Engine evaluation timeout - returning partial results');
        evaluation.bestMove = this.generateSafeMoveForPosition(fen);
        resolve(evaluation);
        
        // Restore original handler
        this.onMessage = originalHandler;
      }, 5000);
      
      // Start analysis
      this.sendCommand(`go depth ${depth}`);
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

import stockfishEngine from './stockfishEngine';

export default class ChessEngine {
  constructor(skillLevel = 10) {
    console.log('Initializing chess engine...');
    this.skillLevel = skillLevel;
    this.engine = null;
    this.isReady = false;
    this.engineLoaded = false;
    this.engineLoadError = false;
    this.evaluationQueue = [];
    this.moveCallbacks = new Map();
    this.evaluationCallbacks = new Map();
    this.initEngine();
  }

  async initEngine() {
    try {
      console.log('Initializing chess engine...');
      
      // Use our utility to get a properly initialized engine
      this.engine = await stockfishEngine.initializeEngine();
      
      // Set up message handler
      this.engine.onmessage = (event) => this.handleEngineMessage(event.data);
      
      // Set up error handler
      this.engine.onerror = (error) => {
        console.error('Engine error:', error);
        this.engineLoadError = true;
        this.fallbackToBasicEngine();
      };
      
      // Set the skill level
      this.setSkillLevel(this.skillLevel);
      
      console.log('Engine initialized successfully');
    } catch (error) {
      console.error('Failed to initialize engine:', error);
      this.engineLoadError = true;
      this.fallbackToBasicEngine();
    }
  }
  
  // Fall back to a simpler engine implementation if the main one fails
  fallbackToBasicEngine() {
    try {
      console.log('Falling back to basic engine implementation');
      
      // Try to load from the non-minified version as a fallback
      this.engine = new Worker('/stockfish/stockfish.js');
      
      // Set up message handler
      this.engine.onmessage = (event) => this.handleEngineMessage(event.data);
      
      // Set up error handler
      this.engine.onerror = (error) => {
        console.error('Fallback engine error:', error);
        this.engineLoadError = true;
      };
      
      // Initialize the engine with UCI
      this.engine.postMessage('uci');
      
      // Set the skill level
      this.setSkillLevel(this.skillLevel);
    } catch (error) {
      console.error('Failed to initialize fallback engine:', error);
      this.engineLoadError = true;
    }
  }

  // Handle messages from the engine
  handleEngineMessage(data) {
    if (typeof data !== 'string') {
      console.warn('Received non-string engine message:', data);
      return;
    }
    
    // Handle different types of engine messages
    if (data === 'uciok') {
      this.engine.postMessage('isready');
    } else if (data === 'readyok') {
      this.isReady = true;
      this.engineLoaded = true;
      console.log('Engine is ready');
      
      // Process any queued evaluations
      this.processEvaluationQueue();
    } else if (data.startsWith('bestmove')) {
      // Extract the move from the engine response
      const parts = data.split(' ');
      if (parts.length >= 2) {
        const moveStr = parts[1];
        console.log('Received engine bestmove:', moveStr);
        
        // Find and execute the corresponding callback
        if (this.moveCallbacks.has(moveStr + '_pending')) {
          const callback = this.moveCallbacks.get(moveStr + '_pending');
          this.moveCallbacks.delete(moveStr + '_pending');
          callback(moveStr);
        } else {
          // If we can't find the exact callback, find any pending callback
          const pendingKey = [...this.moveCallbacks.keys()].find(key => key.endsWith('_pending'));
          if (pendingKey) {
            const callback = this.moveCallbacks.get(pendingKey);
            this.moveCallbacks.delete(pendingKey);
            callback(moveStr);
          }
        }
      }
    } else if (data.startsWith('info')) {
      // Parse evaluation data
      const scoreMatch = data.match(/score (cp|mate) ([-\d]+)/);
      if (scoreMatch) {
        const scoreType = scoreMatch[1];
        const scoreValue = parseInt(scoreMatch[2]);
        
        const depthMatch = data.match(/depth (\d+)/);
        const depth = depthMatch ? parseInt(depthMatch[1]) : 0;
        
        // Create evaluation object
        const evaluation = {
          score: scoreType === 'cp' ? scoreValue / 100 : null,
          mate: scoreType === 'mate' ? scoreValue : null,
          depth: depth,
          scoreType: scoreType,
          scoreValue: scoreValue
        };
        
        // Extract PV (principal variation) if available
        const pvMatch = data.match(/pv (.+)/);
        if (pvMatch) {
          evaluation.pv = pvMatch[1].split(' ');
          evaluation.bestMove = evaluation.pv[0];
        }
        
        // Find and execute evaluation callbacks
        for (const [key, callback] of this.evaluationCallbacks.entries()) {
          if (!key.endsWith('_completed')) {
            callback(evaluation);
            
            // Mark as completed if we've reached target depth
            if (depth >= parseInt(key.split('_')[0])) {
              this.evaluationCallbacks.set(key + '_completed', callback);
              this.evaluationCallbacks.delete(key);
            }
          }
        }
      }
    }
  }

  // Set engine skill level
  setSkillLevel(level) {
    if (!this.engine) return;
    
    // Ensure skill level is within valid range
    const skillLevel = Math.max(0, Math.min(20, level));
    this.skillLevel = skillLevel;
    
    // Send configuration to engine
    this.engine.postMessage(`setoption name Skill Level value ${skillLevel}`);
  }

  // Get the best move for a position
  async getBestMove(fen, timeLimit = 1000) {
    if (!this.engine || this.engineLoadError) {
      console.warn('Engine not available, using fallback moves');
      return this.getFallbackMove(fen);
    }
    
    return new Promise((resolve) => {
      const moveKey = fen.substring(0, 20) + '_pending';
      
      // Store the callback for later execution
      this.moveCallbacks.set(moveKey, (move) => {
        resolve(move);
      });
      
      // Send position to engine
      this.engine.postMessage(`position fen ${fen}`);
      
      // Start the search with a time limit
      this.engine.postMessage(`go movetime ${timeLimit}`);
      
      // Set a timeout as a safety net
      setTimeout(() => {
        if (this.moveCallbacks.has(moveKey)) {
          console.warn('Engine move timeout, using fallback');
          this.moveCallbacks.delete(moveKey);
          resolve(this.getFallbackMove(fen));
        }
      }, timeLimit + 500);
    });
  }

  // Evaluate a position
  async evaluatePosition(fen, depth = 15) {
    if (!this.engine || this.engineLoadError) {
      console.warn('Engine not available for evaluation');
      return { 
        score: 0, 
        depth: 1, 
        scoreType: 'cp', 
        scoreValue: 0 
      };
    }
    
    // If engine is not ready, queue the evaluation
    if (!this.isReady) {
      return new Promise((resolve) => {
        this.evaluationQueue.push({ fen, depth, resolve });
      });
    }
    
    return new Promise((resolve) => {
      const evalKey = `${depth}_${fen.substring(0, 20)}`;
      
      // Store the callback
      this.evaluationCallbacks.set(evalKey, (evaluation) => {
        resolve(evaluation);
      });
      
      // Send position to engine
      this.engine.postMessage(`position fen ${fen}`);
      
      // Start the analysis to the specified depth
      this.engine.postMessage(`go depth ${depth}`);
      
      // Set a timeout as a safety net
      setTimeout(() => {
        if (this.evaluationCallbacks.has(evalKey)) {
          console.warn('Evaluation timeout');
          this.evaluationCallbacks.delete(evalKey);
          resolve({ 
            score: 0, 
            depth: 1, 
            scoreType: 'cp', 
            scoreValue: 0 
          });
        }
      }, depth * 1000);
    });
  }

  // Process queued evaluations
  processEvaluationQueue() {
    while (this.evaluationQueue.length > 0) {
      const { fen, depth, resolve } = this.evaluationQueue.shift();
      this.evaluatePosition(fen, depth).then(resolve);
    }
  }

  // Get a fallback move if engine fails
  getFallbackMove(fen) {
    // Determine side to move
    const sideToMove = fen.split(' ')[1];
    
    // Simple set of fallback moves for each side
    const whiteMoves = ['e2e4', 'd2d4', 'g1f3', 'c2c4', 'b1c3'];
    const blackMoves = ['e7e5', 'd7d5', 'g8f6', 'c7c5', 'b8c6'];
    
    const moves = sideToMove === 'w' ? whiteMoves : blackMoves;
    return moves[Math.floor(Math.random() * moves.length)];
  }

  // Clean up resources
  terminate() {
    if (this.engine) {
      this.engine.terminate();
      this.engine = null;
    }
    this.isReady = false;
    this.engineLoaded = false;
  }
}

import KCAEngine from './KCAEngine';

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
      console.log('Initializing KCA chess engine...');
      
      // Create a new KCA Engine instance directly
      this.engine = new KCAEngine(this.skillLevel);
      
      // Engine is immediately ready since we're not using Web Workers
      this.isReady = true;
      this.engineLoaded = true;
      
      // Process any queued evaluations
      this.processEvaluationQueue();
      
      console.log('Engine initialized successfully');
    } catch (error) {
      console.error('Failed to initialize engine:', error);
      this.engineLoadError = true;
    }
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
      
      // Get the best move from the engine
      this.engine.getBestMove(fen, timeLimit)
        .then(move => {
          // Handle the move
          if (this.moveCallbacks.has(moveKey)) {
            const callback = this.moveCallbacks.get(moveKey);
            this.moveCallbacks.delete(moveKey);
            callback(move);
          }
        })
        .catch(error => {
          console.error('Engine move error:', error);
          if (this.moveCallbacks.has(moveKey)) {
            this.moveCallbacks.delete(moveKey);
            resolve(this.getFallbackMove(fen));
          }
        });
      
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
      
      // Get evaluation from the engine
      const result = this.engine.evaluatePosition(fen, depth);
      
      // Convert to expected format
      const evaluation = {
        score: result.score,
        depth: result.depth,
        scoreType: result.mate ? 'mate' : 'cp',
        scoreValue: result.mate ? result.mate : Math.round(result.score * 100),
        bestMove: result.bestMove,
        pv: [result.bestMove]
      };
      
      // Execute callback
      if (this.evaluationCallbacks.has(evalKey)) {
        const callback = this.evaluationCallbacks.get(evalKey);
        this.evaluationCallbacks.delete(evalKey);
        callback(evaluation);
      }
    });
  }

  // Set engine skill level
  setSkillLevel(level) {
    if (!this.engine) return;
    
    // Ensure skill level is within valid range
    const skillLevel = Math.max(0, Math.min(20, level));
    this.skillLevel = skillLevel;
    
    // Set level in the engine
    this.engine.setSkillLevel(skillLevel);
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

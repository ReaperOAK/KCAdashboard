/**
 * Online Chess Engine - Uses Stockfish Online REST API
 * This provides a drop-in replacement for the local ChessEngine
 */
import StockfishOnlineAPI from './StockfishOnlineAPI';

class OnlineChessEngine {
  constructor(skillLevel = 10) {
    this.skillLevel = Math.min(Math.max(skillLevel, 1), 15); // Limit to 1-15 for API
    this.isReady = true; // Always ready since we're using an API
    this.evaluationQueue = [];
    this.moveCallbacks = new Map();
    this.evaluationCallbacks = new Map();
    
    console.log('Online Chess Engine initialized with level:', this.skillLevel);
  }
  
  /**
   * Get the best move for a position
   * @param {string} fen - FEN string of the position
   * @param {number} timeLimit - Not used for online engine
   * @returns {Promise<string>} - Best move in UCI format
   */
  async getBestMove(fen, timeLimit = 1000) {
    if (!fen) {
      console.warn('Invalid FEN provided to online engine');
      return this.getFallbackMove('');
    }
    
    return new Promise((resolve) => {
      const moveKey = fen.substring(0, 20) + '_pending';
      
      // Store the callback for later execution
      this.moveCallbacks.set(moveKey, (move) => {
        resolve(move);
      });
      
      // Get best move from API
      StockfishOnlineAPI.getBestMove(fen, this.skillLevel)
        .then(move => {
          // If we have a valid move, use it
          if (move && move.length >= 4) {
            if (this.moveCallbacks.has(moveKey)) {
              const callback = this.moveCallbacks.get(moveKey);
              this.moveCallbacks.delete(moveKey);
              callback(move);
            }
          } else {
            // If move is invalid, use fallback
            console.warn('Invalid move from API:', move);
            if (this.moveCallbacks.has(moveKey)) {
              const callback = this.moveCallbacks.get(moveKey);
              this.moveCallbacks.delete(moveKey);
              callback(this.getFallbackMove(fen));
            }
          }
        })
        .catch(error => {
          console.error('API error:', error);
          if (this.moveCallbacks.has(moveKey)) {
            this.moveCallbacks.delete(moveKey);
            resolve(this.getFallbackMove(fen));
          }
        });
      
      // Set a timeout as a safety net
      setTimeout(() => {
        if (this.moveCallbacks.has(moveKey)) {
          console.warn('API request timeout, using fallback');
          this.moveCallbacks.delete(moveKey);
          resolve(this.getFallbackMove(fen));
        }
      }, timeLimit * 2); // Double the timeLimit for API request
    });
  }
  
  /**
   * Evaluate a position
   * @param {string} fen - FEN string of the position
   * @param {number} depth - Analysis depth
   * @returns {Promise<Object>} - Evaluation results
   */
  async evaluatePosition(fen, depth = 15) {
    if (!fen) {
      console.warn('Invalid FEN provided to online engine');
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
      
      // Get evaluation from API
      StockfishOnlineAPI.analyzePosition(fen, Math.min(depth, this.skillLevel))
        .then(analysis => {
          // Convert to expected format
          const evaluation = {
            score: analysis.mate ? null : analysis.evaluation,
            depth: analysis.depth,
            scoreType: analysis.mate ? 'mate' : 'cp',
            scoreValue: analysis.mate ? analysis.mate : Math.round(analysis.evaluation * 100),
            bestMove: analysis.bestMove,
            pv: analysis.continuation
          };
          
          // Execute callback
          if (this.evaluationCallbacks.has(evalKey)) {
            const callback = this.evaluationCallbacks.get(evalKey);
            this.evaluationCallbacks.delete(evalKey);
            callback(evaluation);
          }
        })
        .catch(error => {
          console.error('API evaluation error:', error);
          if (this.evaluationCallbacks.has(evalKey)) {
            this.evaluationCallbacks.delete(evalKey);
            resolve({ 
              score: 0, 
              depth: 1, 
              scoreType: 'cp', 
              scoreValue: 0 
            });
          }
        });
      
      // Set a timeout as a safety net
      setTimeout(() => {
        if (this.evaluationCallbacks.has(evalKey)) {
          console.warn('Evaluation API timeout');
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
  
  /**
   * Process queued evaluations
   */
  processEvaluationQueue() {
    while (this.evaluationQueue.length > 0) {
      const { fen, depth, resolve } = this.evaluationQueue.shift();
      this.evaluatePosition(fen, depth).then(resolve);
    }
  }
  
  /**
   * Get fallback move when API fails
   * @param {string} fen - FEN string
   * @returns {string} - UCI format move
   */
  getFallbackMove(fen) {
    // Determine side to move
    const sideToMove = fen.split(' ')[1];
    
    // Simple set of fallback moves for each side
    const whiteMoves = ['e2e4', 'd2d4', 'g1f3', 'c2c4', 'b1c3'];
    const blackMoves = ['e7e5', 'd7d5', 'g8f6', 'c7c5', 'b8c6'];
    
    const moves = sideToMove === 'w' ? whiteMoves : blackMoves;
    return moves[Math.floor(Math.random() * moves.length)];
  }
  
  /**
   * Set engine skill level
   * @param {number} level - Skill level (1-15)
   */
  setSkillLevel(level) {
    this.skillLevel = Math.min(Math.max(level, 1), 15);
    console.log('Online Engine level set to:', this.skillLevel);
  }
  
  /**
   * Cleanup resources
   */
  terminate() {
    this.moveCallbacks.clear();
    this.evaluationCallbacks.clear();
    this.evaluationQueue = [];
  }
}

export default OnlineChessEngine;

/**
 * KCA Chess Engine - A lightweight chess engine for KCA Dashboard
 * This is a custom implementation that doesn't rely on external web workers
 */

class KCAEngine {
  constructor(level = 10) {
    this.level = Math.min(Math.max(level, 1), 20); // Keep level between 1-20
    this.callbacks = {
      bestMove: null,
      evaluation: null
    };
    this.isReady = true;
    
    // Basic opening moves for white and black
    this.openingMoves = {
      white: ['e2e4', 'd2d4', 'g1f3', 'c2c4', 'b1c3', 'e2e3', 'f2f4', 'd2d3'],
      black: ['e7e5', 'd7d5', 'g8f6', 'c7c5', 'b8c6', 'e7e6', 'c7c6', 'g7g6']
    };
    
    // Common responses to popular openings
    this.responses = {
      'e2e4': ['e7e5', 'c7c5', 'e7e6', 'c7c6', 'd7d5', 'g8f6'],
      'd2d4': ['d7d5', 'g8f6', 'c7c6', 'e7e6', 'c7c5'],
      'g1f3': ['g8f6', 'd7d5', 'c7c5', 'e7e6'],
      'c2c4': ['e7e5', 'c7c5', 'g8f6', 'e7e6'],
      'e7e5': ['g1f3', 'b1c3', 'f2f4', 'd2d4', 'f1c4'],
      'd7d5': ['c2c4', 'g1f3', 'e2e3', 'b1c3'],
      'g8f6': ['c2c4', 'd2d4', 'g1f3', 'b1c3']
    };
    
    console.log('KCA Engine initialized with level:', this.level);
  }
  
  // Parse a FEN string to extract side to move
  parseFen(fen) {
    const parts = fen.split(' ');
    const sideToMove = parts.length > 1 ? parts[1] : 'w';
    return { sideToMove };
  }
  
  // Generate a move for the given position
  generateMove(position = 'startpos') {
    // If it's a FEN string, extract side to move
    let sideToMove = 'w';
    if (position !== 'startpos' && position.includes(' ')) {
      sideToMove = this.parseFen(position).sideToMove;
    }
    
    // Check if we're in an opening and have a specific response
    const moves = position.match(/moves\s+(.*)/);
    if (moves && moves[1]) {
      const moveList = moves[1].trim().split(' ');
      const lastMove = moveList[moveList.length - 1];
      
      // If we have a response to the last move, use it
      if (this.responses[lastMove]) {
        const possibleResponses = this.responses[lastMove];
        return possibleResponses[Math.floor(Math.random() * possibleResponses.length)];
      }
    }
    
    // Otherwise use standard opening moves based on side
    const moveSet = sideToMove === 'w' ? this.openingMoves.white : this.openingMoves.black;
    return moveSet[Math.floor(Math.random() * moveSet.length)];
  }
  
  // Evaluate a position
  evaluatePosition(position = 'startpos', depth = 10) {
    // Create a simple evaluation
    const evaluation = {
      score: (Math.random() * 2 - 1) * this.level / 10, // Random score between -level/10 and +level/10
      depth: Math.min(depth, this.level),
      mate: null,
      bestMove: this.generateMove(position)
    };
    
    // Trigger callback if set
    if (this.callbacks.evaluation) {
      this.callbacks.evaluation(evaluation);
    }
    
    return evaluation;
  }
  
  // Get the best move for a position
  getBestMove(position = 'startpos', timeLimit = 1000) {
    const move = this.generateMove(position);
    
    // Simulate thinking time based on engine level
    const thinkTime = Math.min(300 + (this.level * 20), timeLimit);
    
    return new Promise((resolve) => {
      // Simulate engine "thinking"
      setTimeout(() => {
        // Trigger callback if set
        if (this.callbacks.bestMove) {
          this.callbacks.bestMove(move);
        }
        resolve(move);
      }, thinkTime);
    });
  }
  
  // Set engine skill level
  setSkillLevel(level) {
    this.level = Math.min(Math.max(level, 1), 20);
    console.log('KCA Engine level set to:', this.level);
  }
  
  // Register a callback for best move
  onBestMove(callback) {
    this.callbacks.bestMove = callback;
  }
  
  // Register a callback for evaluation
  onEvaluation(callback) {
    this.callbacks.evaluation = callback;
  }
  
  // Cleanup resources
  terminate() {
    this.callbacks = {
      bestMove: null,
      evaluation: null
    };
  }
}

export default KCAEngine;

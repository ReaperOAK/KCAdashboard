/**
 * KCA Chess Engine - A lightweight chess engine for KCA Dashboard
 * This is a custom implementation that doesn't rely on external web workers
 */
import { Chess } from 'chess.js';

class KCAEngine {
  constructor(level = 10) {
    this.level = Math.min(Math.max(level, 1), 20); // Keep level between 1-20
    this.callbacks = {
      bestMove: null,
      evaluation: null
    };
    this.isReady = true;
    this.chess = new Chess(); // Use chess.js for move validation
    
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
  
  // Generate a valid move for the given position
  generateMove(position = 'startpos') {
    try {
      // Parse the position and set up the chess board
      if (position === 'startpos') {
        this.chess.reset();
      } else if (position.includes('fen')) {
        const fenMatch = position.match(/position fen ([^m]+)(?:moves|$)/);
        if (fenMatch && fenMatch[1]) {
          this.chess.load(fenMatch[1].trim());
        } else {
          this.chess.reset();
        }
      } else if (position.includes(' ')) {
        // Direct FEN string
        try {
          this.chess.load(position);
        } catch (e) {
          console.warn('Failed to load position:', e);
          this.chess.reset();
        }
      }
      
      // If position includes moves, apply them
      if (position.includes('moves')) {
        const movesMatch = position.match(/moves\s+(.*)/);
        if (movesMatch && movesMatch[1]) {
          const moves = movesMatch[1].trim().split(' ');
          moves.forEach(move => {
            try {
              // Apply each move in UCI format (e2e4 -> { from: 'e2', to: 'e4' })
              if (move.length >= 4) {
                const from = move.substring(0, 2);
                const to = move.substring(2, 4);
                const promotion = move.length > 4 ? move.substring(4, 5) : undefined;
                this.chess.move({ from, to, promotion });
              }
            } catch (e) {
              console.warn('Failed to apply move:', move, e);
            }
          });
        }
      }
      
      // Get all legal moves from the current position
      const legalMoves = this.chess.moves({ verbose: true });
      
      if (legalMoves.length === 0) {
        return ''; // No legal moves
      }
      
      // Select a random legal move
      const randomMove = legalMoves[Math.floor(Math.random() * legalMoves.length)];
      
      // Convert to UCI format (e2e4)
      return randomMove.from + randomMove.to + (randomMove.promotion || '');
    } catch (error) {
      console.error('Error generating move:', error);
      return 'e2e4'; // Default fallback move if everything fails
    }
  }
  
  // Evaluate a position
  evaluatePosition(position = 'startpos', depth = 10) {
    try {
      // Update chess instance with position
      if (position === 'startpos') {
        this.chess.reset();
      } else if (typeof position === 'string' && position.includes(' ')) {
        try {
          this.chess.load(position);
        } catch (e) {
          console.warn('Failed to load position for evaluation:', e);
          this.chess.reset();
        }
      }
      
      // Get material count for a basic evaluation
      const material = this.calculateMaterial();
      const randomFactor = (Math.random() * 0.2 - 0.1) * this.level / 5;
      
      // Create an evaluation
      const evaluation = {
        score: material + randomFactor, // Material score with slight randomness
        depth: Math.min(depth, this.level),
        mate: null,
        bestMove: this.generateMove(position)
      };
      
      // Trigger callback if set
      if (this.callbacks.evaluation) {
        this.callbacks.evaluation(evaluation);
      }
      
      return evaluation;
    } catch (error) {
      console.error('Error evaluating position:', error);
      return {
        score: 0,
        depth: depth,
        mate: null,
        bestMove: 'e2e4'
      };
    }
  }
  
  // Calculate material balance (positive for white, negative for black)
  calculateMaterial() {
    try {
      const board = this.chess.board();
      let material = 0;
      
      // Piece values
      const values = {
        p: 1,   // pawn
        n: 3,   // knight
        b: 3,   // bishop
        r: 5,   // rook
        q: 9,   // queen
        k: 0    // king (zero value as it doesn't affect material balance)
      };
      
      // Calculate material balance
      for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
          const piece = board[row][col];
          if (piece) {
            const value = values[piece.type];
            material += piece.color === 'w' ? value : -value;
          }
        }
      }
      
      return material;
    } catch (error) {
      console.error('Error calculating material:', error);
      return 0;
    }
  }
  
  // Get the best move for a position
  getBestMove(position = 'startpos', timeLimit = 1000) {
    // Simulate thinking time based on engine level
    const thinkTime = Math.min(300 + (this.level * 20), timeLimit);
    
    return new Promise((resolve) => {
      // Simulate engine "thinking"
      setTimeout(() => {
        const move = this.generateMove(position);
        
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
    this.chess = null;
  }
}

export default KCAEngine;

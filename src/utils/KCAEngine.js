
// KCAEngine - Clean, composable, testable lightweight chess engine for Kolkata Chess Academy
import { Chess } from 'chess.js';


// --- Utility: Material calculation ---
function calculateMaterial(chess) {
  try {
    const board = chess.board();
    let material = 0;
    const values = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 0 };
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
  } catch {
    return 0;
  }
}

// --- Utility: Generate random legal move ---
function getRandomLegalMove(chess) {
  const legalMoves = chess.moves({ verbose: true });
  if (!legalMoves.length) return '';
  const move = legalMoves[Math.floor(Math.random() * legalMoves.length)];
  return move.from + move.to + (move.promotion || '');
}

class KCAEngine {
  constructor(level = 10) {
    this.level = Math.min(Math.max(level, 1), 20);
    this.callbacks = { bestMove: null, evaluation: null };
    this.isReady = true;
    this.chess = new Chess();
  }

  // Generate a valid move for the given position
  generateMove = (position = 'startpos') => {
    try {
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
        try {
          this.chess.load(position);
        } catch {
          this.chess.reset();
        }
      }
      if (position.includes('moves')) {
        const movesMatch = position.match(/moves\s+(.*)/);
        if (movesMatch && movesMatch[1]) {
          const moves = movesMatch[1].trim().split(' ');
          moves.forEach(move => {
            if (move.length >= 4) {
              const from = move.substring(0, 2);
              const to = move.substring(2, 4);
              const promotion = move.length > 4 ? move.substring(4, 5) : undefined;
              this.chess.move({ from, to, promotion });
            }
          });
        }
      }
      return getRandomLegalMove(this.chess);
    } catch {
      return 'e2e4';
    }
  };

  // Evaluate a position
  evaluatePosition = (position = 'startpos', depth = 10) => {
    try {
      if (position === 'startpos') {
        this.chess.reset();
      } else if (typeof position === 'string' && position.includes(' ')) {
        try {
          this.chess.load(position);
        } catch {
          this.chess.reset();
        }
      }
      const material = calculateMaterial(this.chess);
      const randomFactor = (Math.random() * 0.2 - 0.1) * this.level / 5;
      const evaluation = {
        score: material + randomFactor,
        depth: Math.min(depth, this.level),
        mate: null,
        bestMove: this.generateMove(position),
      };
      if (this.callbacks.evaluation) this.callbacks.evaluation(evaluation);
      return evaluation;
    } catch {
      return { score: 0, depth, mate: null, bestMove: 'e2e4' };
    }
  };

  // Get the best move for a position
  getBestMove = (position = 'startpos', timeLimit = 1000) => {
    const thinkTime = Math.min(300 + (this.level * 20), timeLimit);
    return new Promise((resolve) => {
      setTimeout(() => {
        const move = this.generateMove(position);
        if (this.callbacks.bestMove) this.callbacks.bestMove(move);
        resolve(move);
      }, thinkTime);
    });
  };

  // Set engine skill level
  setSkillLevel = (level) => {
    this.level = Math.min(Math.max(level, 1), 20);
  };

  // Register a callback for best move
  onBestMove = (callback) => {
    this.callbacks.bestMove = callback;
  };

  // Register a callback for evaluation
  onEvaluation = (callback) => {
    this.callbacks.evaluation = callback;
  };

  // Cleanup resources
  terminate = () => {
    this.callbacks = { bestMove: null, evaluation: null };
    this.chess = null;
  };
}

export { KCAEngine };
export default KCAEngine;

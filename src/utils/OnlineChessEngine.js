
// OnlineChessEngine - Clean, composable, accessible API client for Stockfish Online
import stockfishOnlineAPI from './StockfishOnlineAPI';

// --- Utility: Fallback move selection ---
function getFallbackMove(fen) {
  const sideToMove = fen.split(' ')[1];
  const whiteMoves = ['e2e4', 'd2d4', 'g1f3', 'c2c4', 'b1c3'];
  const blackMoves = ['e7e5', 'd7d5', 'g8f6', 'c7c5', 'b8c6'];
  const moves = sideToMove === 'w' ? whiteMoves : blackMoves;
  return moves[Math.floor(Math.random() * moves.length)];
}

// --- Main Engine Class ---
class OnlineChessEngine {
  constructor(skillLevel = 10) {
    this.skillLevel = Math.min(Math.max(skillLevel, 1), 15);
    this.isReady = true;
    this.evaluationQueue = [];
    this.moveCallbacks = new Map();
    this.evaluationCallbacks = new Map();
  }

  // Get the best move for a position
  getBestMove = (fen, timeLimit = 1000) => {
    if (!fen) return Promise.resolve(getFallbackMove(''));
    const moveKey = fen.substring(0, 20) + '_pending';
    return new Promise((resolve) => {
      this.moveCallbacks.set(moveKey, resolve);
      stockfishOnlineAPI.getBestMove(fen, this.skillLevel)
        .then((move) => {
          if (move && move.length >= 4) {
            if (this.moveCallbacks.has(moveKey)) {
              const cb = this.moveCallbacks.get(moveKey);
              this.moveCallbacks.delete(moveKey);
              cb(move);
            }
          } else {
            if (this.moveCallbacks.has(moveKey)) {
              const cb = this.moveCallbacks.get(moveKey);
              this.moveCallbacks.delete(moveKey);
              cb(getFallbackMove(fen));
            }
          }
        })
        .catch(() => {
          if (this.moveCallbacks.has(moveKey)) {
            this.moveCallbacks.delete(moveKey);
            resolve(getFallbackMove(fen));
          }
        });
      setTimeout(() => {
        if (this.moveCallbacks.has(moveKey)) {
          this.moveCallbacks.delete(moveKey);
          resolve(getFallbackMove(fen));
        }
      }, timeLimit * 2);
    });
  };

  // Evaluate a position
  evaluatePosition = (fen, depth = 15) => {
    if (!fen) {
      return Promise.resolve({ score: 0, depth: 1, scoreType: 'cp', scoreValue: 0 });
    }
    if (!this.isReady) {
      return new Promise((resolve) => {
        this.evaluationQueue.push({ fen, depth, resolve });
      });
    }
    const evalKey = `${depth}_${fen.substring(0, 20)}`;
    return new Promise((resolve) => {
      this.evaluationCallbacks.set(evalKey, resolve);
      stockfishOnlineAPI.analyzePosition(fen, Math.min(depth, this.skillLevel))
        .then((analysis) => {
          const evaluation = {
            score: analysis.mate ? null : analysis.evaluation,
            depth: analysis.depth,
            scoreType: analysis.mate ? 'mate' : 'cp',
            scoreValue: analysis.mate ? analysis.mate : Math.round(analysis.evaluation * 100),
            bestMove: analysis.bestMove,
            pv: analysis.continuation,
          };
          if (this.evaluationCallbacks.has(evalKey)) {
            const cb = this.evaluationCallbacks.get(evalKey);
            this.evaluationCallbacks.delete(evalKey);
            cb(evaluation);
          }
        })
        .catch(() => {
          if (this.evaluationCallbacks.has(evalKey)) {
            this.evaluationCallbacks.delete(evalKey);
            resolve({ score: 0, depth: 1, scoreType: 'cp', scoreValue: 0 });
          }
        });
      setTimeout(() => {
        if (this.evaluationCallbacks.has(evalKey)) {
          this.evaluationCallbacks.delete(evalKey);
          resolve({ score: 0, depth: 1, scoreType: 'cp', scoreValue: 0 });
        }
      }, depth * 1000);
    });
  };

  // Process queued evaluations
  processEvaluationQueue = () => {
    while (this.evaluationQueue.length > 0) {
      const { fen, depth, resolve } = this.evaluationQueue.shift();
      this.evaluatePosition(fen, depth).then(resolve);
    }
  };

  // Set engine skill level
  setSkillLevel = (level) => {
    this.skillLevel = Math.min(Math.max(level, 1), 15);
  };

  // Cleanup resources
  terminate = () => {
    this.moveCallbacks.clear();
    this.evaluationCallbacks.clear();
    this.evaluationQueue = [];
  };
}

export { OnlineChessEngine };
export default OnlineChessEngine;

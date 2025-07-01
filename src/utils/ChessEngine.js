
import { KCAEngine } from './KCAEngine';

// --- Utility: Fallback move selection ---
function getFallbackMove(fen) {
  const sideToMove = fen.split(' ')[1];
  const whiteMoves = ['e2e4', 'd2d4', 'g1f3', 'c2c4', 'b1c3'];
  const blackMoves = ['e7e5', 'd7d5', 'g8f6', 'c7c5', 'b8c6'];
  const moves = sideToMove === 'w' ? whiteMoves : blackMoves;
  return moves[Math.floor(Math.random() * moves.length)];
}

export default class ChessEngine {
  constructor(skillLevel = 10) {
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
      this.engine = new KCAEngine(this.skillLevel);
      this.isReady = true;
      this.engineLoaded = true;
      this.processEvaluationQueue();
    } catch {
      this.engineLoadError = true;
    }
  }

  getBestMove = (fen, timeLimit = 1000) => {
    if (!this.engine || this.engineLoadError) {
      return Promise.resolve(getFallbackMove(fen));
    }
    const moveKey = fen.substring(0, 20) + '_pending';
    return new Promise((resolve) => {
      this.moveCallbacks.set(moveKey, resolve);
      this.engine.getBestMove(fen, timeLimit)
        .then((move) => {
          if (this.moveCallbacks.has(moveKey)) {
            const cb = this.moveCallbacks.get(moveKey);
            this.moveCallbacks.delete(moveKey);
            cb(move);
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
      }, timeLimit + 500);
    });
  };

  evaluatePosition = (fen, depth = 15) => {
    if (!this.engine || this.engineLoadError) {
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
      const result = this.engine.evaluatePosition(fen, depth);
      const evaluation = {
        score: result.score,
        depth: result.depth,
        scoreType: result.mate ? 'mate' : 'cp',
        scoreValue: result.mate ? result.mate : Math.round(result.score * 100),
        bestMove: result.bestMove,
        pv: [result.bestMove],
      };
      if (this.evaluationCallbacks.has(evalKey)) {
        const cb = this.evaluationCallbacks.get(evalKey);
        this.evaluationCallbacks.delete(evalKey);
        cb(evaluation);
      }
    });
  };

  setSkillLevel = (level) => {
    if (!this.engine) return;
    const skillLevel = Math.max(0, Math.min(20, level));
    this.skillLevel = skillLevel;
    this.engine.setSkillLevel(skillLevel);
  };

  processEvaluationQueue = () => {
    while (this.evaluationQueue.length > 0) {
      const { fen, depth, resolve } = this.evaluationQueue.shift();
      this.evaluatePosition(fen, depth).then(resolve);
    }
  };

  terminate = () => {
    if (this.engine) {
      this.engine.terminate();
      this.engine = null;
    }
    this.isReady = false;
    this.engineLoaded = false;
  };
}

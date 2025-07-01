
// ChessEngineFactory - Clean, composable, testable engine factory
import LocalChessEngine from './ChessEngine';
import OnlineChessEngine from './OnlineChessEngine';

/**
 * Create a chess engine instance
 * @param {Object} options
 * @param {boolean} options.useOnlineAPI
 * @param {number} options.skillLevel
 * @returns {Object} Chess engine instance
 */
export function createChessEngine(options = {}) {
  const { useOnlineAPI = false, skillLevel = 10 } = options;
  return useOnlineAPI
    ? new OnlineChessEngine(skillLevel)
    : new LocalChessEngine(skillLevel);
}

// For backward compatibility if needed
const ChessEngineFactory = { createEngine: createChessEngine };
export default ChessEngineFactory;

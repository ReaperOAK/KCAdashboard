/**
 * Chess Engine Factory
 * Creates appropriate chess engine instances based on configuration
 */
import LocalChessEngine from './ChessEngine';
import OnlineChessEngine from './OnlineChessEngine';

const ChessEngineFactory = {
  /**
   * Create a chess engine instance
   * @param {Object} options - Engine configuration
   * @param {boolean} options.useOnlineAPI - Whether to use the online API
   * @param {number} options.skillLevel - Engine skill level
   * @returns {Object} - Chess engine instance
   */
  createEngine(options = {}) {
    const { useOnlineAPI = false, skillLevel = 10 } = options;
    
    if (useOnlineAPI) {
      console.log('Creating Stockfish Online API engine instance');
      return new OnlineChessEngine(skillLevel);
    } else {
      console.log('Creating local chess engine instance');
      return new LocalChessEngine(skillLevel);
    }
  }
};

export default ChessEngineFactory;

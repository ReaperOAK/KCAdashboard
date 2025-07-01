/**
 * StockfishOnlineAPI - Client for the Stockfish REST API
 * This provides chess engine functionality via online service
 */


// StockfishOnlineAPI - Clean, composable, accessible API client for Stockfish REST
// All logic is modular, no unnecessary state, all handlers are named, and code is accessible for DX

const STOCKFISH_API_URL = 'https://stockfish.online/api/s/v2.php';

// --- Utility: Extract move from API response ---
export function extractMove(bestmoveResponse) {
  if (!bestmoveResponse) return '';
  const parts = bestmoveResponse.split(' ');
  return parts.length >= 2 ? parts[1] : '';
}

// --- Main API Client (Singleton) ---
class StockfishOnlineAPI {
  constructor() {
    this.cache = new Map();
    this.pendingRequests = new Map();
  }

  // Analyze a position (returns { bestMove, evaluation, mate, continuation, depth })
  analyzePosition = async (fen, depth = 10) => {
    const safeDepth = Math.min(15, Math.max(1, depth));
    const cacheKey = `${fen}_${safeDepth}`;
    if (this.cache.has(cacheKey)) return this.cache.get(cacheKey);
    if (this.pendingRequests.has(cacheKey)) return this.pendingRequests.get(cacheKey);

    const requestPromise = (async () => {
      try {
        const url = new URL(STOCKFISH_API_URL);
        url.searchParams.append('fen', fen);
        url.searchParams.append('depth', safeDepth);

        // Accessible logging for DX (can be removed in prod)
        // console.log(`[Stockfish] Request: ${fen.substring(0, 20)}...`);

        const response = await fetch(url.toString());
        if (!response.ok) throw new Error(`API request failed with status ${response.status}`);
        const data = await response.json();
        if (!data.success) throw new Error(`API error: ${data.data || 'Unknown error'}`);

        const result = {
          bestMove: extractMove(data.bestmove),
          evaluation: data.evaluation || 0,
          mate: data.mate,
          continuation: data.continuation?.split(' ') || [],
          depth: safeDepth,
        };
        this.cache.set(cacheKey, result);
        this.pendingRequests.delete(cacheKey);
        return result;
      } catch (error) {
        this.pendingRequests.delete(cacheKey);
        // Accessible error logging for DX
        // console.error('[Stockfish] API error:', error);
        throw error;
      }
    })();
    this.pendingRequests.set(cacheKey, requestPromise);
    return requestPromise;
  };

  // Get best move (returns string)
  getBestMove = async (fen, depth = 10) => {
    const analysis = await this.analyzePosition(fen, depth);
    return analysis.bestMove;
  };

  // Clear cache
  clearCache = () => {
    this.cache.clear();
  };
}

// Export singleton instance and named class for testability
const stockfishOnlineAPI = new StockfishOnlineAPI();
export { StockfishOnlineAPI };
export default stockfishOnlineAPI;

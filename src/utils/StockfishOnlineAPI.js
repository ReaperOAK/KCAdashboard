/**
 * StockfishOnlineAPI - Client for the Stockfish REST API
 * This provides chess engine functionality via online service
 */

const STOCKFISH_API_URL = 'https://stockfish.online/api/s/v2.php';

class StockfishOnlineAPI {
  constructor() {
    this.cache = new Map(); // Cache for API responses
    this.pendingRequests = new Map(); // Track pending API requests
  }

  /**
   * Analyze a position using the Stockfish Online API
   * @param {string} fen - FEN string of the position to analyze
   * @param {number} depth - Analysis depth (1-15)
   * @returns {Promise<Object>} - Analysis results
   */
  async analyzePosition(fen, depth = 10) {
    // Validate depth
    depth = Math.min(15, Math.max(1, depth));
    
    // Create cache key
    const cacheKey = `${fen}_${depth}`;
    
    // Check cache first
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }
    
    // Check if there's already a pending request for this position/depth
    if (this.pendingRequests.has(cacheKey)) {
      return this.pendingRequests.get(cacheKey);
    }
    
    // Create a promise for this request
    const requestPromise = new Promise(async (resolve, reject) => {
      try {
        // Construct API URL with parameters
        const url = new URL(STOCKFISH_API_URL);
        url.searchParams.append('fen', fen);
        url.searchParams.append('depth', depth);
        
        console.log(`Making Stockfish API request for position: ${fen.substring(0, 20)}...`);
        
        // Make the API request
        const response = await fetch(url.toString());
        
        if (!response.ok) {
          throw new Error(`API request failed with status ${response.status}`);
        }
        
        const data = await response.json();
        
        if (!data.success) {
          throw new Error(`API error: ${data.data || 'Unknown error'}`);
        }
        
        // Format the response
        const result = {
          bestMove: this.extractMove(data.bestmove),
          evaluation: data.evaluation || 0,
          mate: data.mate,
          continuation: data.continuation?.split(' ') || [],
          depth: depth
        };
        
        console.log(`Received Stockfish API response: move=${result.bestMove}, eval=${result.evaluation}`);
        
        // Save to cache
        this.cache.set(cacheKey, result);
        
        // Remove from pending requests
        this.pendingRequests.delete(cacheKey);
        
        resolve(result);
      } catch (error) {
        console.error('Stockfish API error:', error);
        
        // Remove from pending requests
        this.pendingRequests.delete(cacheKey);
        reject(error);
      }
    });
    
    // Store the pending request
    this.pendingRequests.set(cacheKey, requestPromise);
    
    return requestPromise;
  }
  
  /**
   * Extract the move from the bestmove response
   * @param {string} bestmoveResponse - Response from API (e.g. "bestmove e2e4 ponder e7e5")
   * @returns {string} - Just the move (e.g. "e2e4")
   */
  extractMove(bestmoveResponse) {
    if (!bestmoveResponse) return '';
    
    const parts = bestmoveResponse.split(' ');
    // Return the move part, which is the second word in "bestmove e2e4 ponder e7e5"
    return parts.length >= 2 ? parts[1] : '';
  }
  
  /**
   * Get the best move for a position
   * @param {string} fen - FEN string of the position
   * @param {number} depth - Analysis depth
   * @returns {Promise<string>} - Best move in UCI format (e.g., "e2e4")
   */
  async getBestMove(fen, depth = 10) {
    try {
      const analysis = await this.analyzePosition(fen, depth);
      return analysis.bestMove;
    } catch (error) {
      console.error('Error getting best move:', error);
      throw error;
    }
  }
  
  /**
   * Clear the analysis cache
   */
  clearCache() {
    this.cache.clear();
  }
}

// Export a singleton instance
const stockfishOnlineAPI = new StockfishOnlineAPI();
export default stockfishOnlineAPI;

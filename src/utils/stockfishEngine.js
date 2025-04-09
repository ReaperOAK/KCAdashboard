/**
 * Utility to create and manage Stockfish engine instances
 * This handles cases where the stockfish file might be modified
 */

const stockfishEngine = {
  /**
   * Create a Stockfish worker, using the blob URL if available
   * @returns {Worker} A new Stockfish worker instance
   */
  createWorker() {
    try {
      // If we have a blob URL from the protection mechanism, use that
      if (window.stockfishWorkerUrl) {
        console.log('Using protected Stockfish implementation from blob URL');
        return new Worker(window.stockfishWorkerUrl);
      }
      
      // Otherwise, try loading directly from file
      console.log('Loading Stockfish from file path');
      return new Worker('/stockfish/stockfish.min.js');
    } catch (error) {
      console.error('Failed to create Stockfish worker:', error);
      
      // Last resort: try the non-minified version
      try {
        console.log('Attempting to load fallback Stockfish implementation');
        return new Worker('/stockfish/stockfish.js');
      } catch (fallbackError) {
        console.error('Failed to create fallback Stockfish worker:', fallbackError);
        throw new Error('Could not load Stockfish engine: ' + error.message);
      }
    }
  },
  
  /**
   * Initialize a Stockfish worker and set up basic message handling
   * @returns {Promise<Worker>} A promise that resolves to an initialized worker
   */
  initializeEngine() {
    return new Promise((resolve, reject) => {
      try {
        const worker = this.createWorker();
        let initialized = false;
        
        worker.onmessage = function(e) {
          if (e.data === 'uciok') {
            initialized = true;
            resolve(worker);
          }
        };
        
        worker.onerror = function(e) {
          reject(new Error('Engine initialization error: ' + e.message));
        };
        
        // Send UCI command to initialize
        worker.postMessage('uci');
        
        // Set timeout for initialization
        setTimeout(() => {
          if (!initialized) {
            worker.terminate();
            reject(new Error('Engine initialization timed out'));
          }
        }, 3000);
      } catch (error) {
        reject(error);
      }
    });
  }
};

export default stockfishEngine;

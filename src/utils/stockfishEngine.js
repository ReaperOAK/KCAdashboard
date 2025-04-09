/**
 * Utility to create and manage Stockfish engine instances
 * This handles cases where the stockfish file might be modified
 */

const stockfishEngine = {
  /**
   * Create a Stockfish worker, using the direct blob URL if available
   * @returns {Worker} A new Stockfish worker instance
   */
  createWorker() {
    try {
      // First priority: use the Direct Bootstrap blob URL if available
      if (window.stockfishWorkerUrl) {
        console.log('Using direct Stockfish implementation from blob URL');
        return new Worker(window.stockfishWorkerUrl);
      }
      
      // Otherwise, try loading from file path as a fallback
      console.log('Loading Stockfish from file path');
      return new Worker('/stockfish/stockfish-minimal.js');
    } catch (error) {
      console.error('Failed to create Stockfish worker:', error);
      throw new Error('Could not load Stockfish engine: ' + error.message);
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
        let initTimeout;
        
        worker.onmessage = function(e) {
          console.log('Engine message:', e.data);
          
          if (e.data === 'uciok') {
            initialized = true;
            clearTimeout(initTimeout);
            resolve(worker);
          }
        };
        
        worker.onerror = function(e) {
          clearTimeout(initTimeout);
          reject(new Error('Engine initialization error: ' + e.message));
        };
        
        // Send UCI command to initialize
        worker.postMessage('uci');
        
        // Set timeout for initialization
        initTimeout = setTimeout(() => {
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

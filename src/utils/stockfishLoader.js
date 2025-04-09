/**
 * Utility for reliably loading the Stockfish chess engine
 */

// Cache for engine workers
let engineCache = null;

export default {
  /**
   * Load the Stockfish engine using the most reliable method available
   * @param {Number} timeoutMs - Timeout in milliseconds to wait for engine initialization
   * @returns {Promise<Worker>} - A promise that resolves to the engine worker
   */
  loadEngine: function(timeoutMs = 2000) {
    // Return cached engine if available
    if (engineCache) {
      return Promise.resolve(engineCache);
    }
    
    return new Promise((resolve, reject) => {
      try {
        // Determine the engine path to use
        let enginePath = '/stockfish/stockfish.min.js';
        
        // Check if a custom path was set by the protection script
        if (window.stockfishPath) {
          enginePath = window.stockfishPath;
        }
        
        console.log(`Loading Stockfish engine from: ${enginePath}`);
        
        // Create the worker
        const worker = new Worker(enginePath);
        let initialized = false;
        let initTimeout;
        
        // Set up message handler
        worker.onmessage = function(e) {
          if (typeof e.data === 'string' && e.data === 'uciok') {
            clearTimeout(initTimeout);
            initialized = true;
            engineCache = worker;
            resolve(worker);
          }
        };
        
        // Set up error handler
        worker.onerror = function(error) {
          clearTimeout(initTimeout);
          console.error('Engine initialization error:', error);
          
          // Try fallback if available
          if (enginePath !== '/stockfish/stockfish.js') {
            console.log('Trying fallback engine...');
            window.stockfishPath = '/stockfish/stockfish.js';
            
            // Call loadEngine recursively with the fallback
            this.loadEngine(timeoutMs).then(resolve).catch(reject);
          } else {
            reject(new Error('Failed to initialize Stockfish engine'));
          }
        }.bind(this);
        
        // Initialize the engine
        worker.postMessage('uci');
        
        // Set timeout for initialization
        initTimeout = setTimeout(() => {
          if (!initialized) {
            console.warn('Engine initialization timed out');
            worker.terminate();
            
            // Try fallback if available
            if (enginePath !== '/stockfish/stockfish.js') {
              console.log('Trying fallback engine after timeout...');
              window.stockfishPath = '/stockfish/stockfish.js';
              
              // Call loadEngine recursively with the fallback
              this.loadEngine(timeoutMs).then(resolve).catch(reject);
            } else {
              reject(new Error('Engine initialization timed out'));
            }
          }
        }, timeoutMs);
      } catch (error) {
        reject(error);
      }
    });
  },
  
  /**
   * Terminate any cached engine instances
   */
  cleanup: function() {
    if (engineCache) {
      engineCache.terminate();
      engineCache = null;
    }
  }
};

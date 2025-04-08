/**
 * Stockfish.js loader
 * This script can be included in the public folder to handle loading
 * the Stockfish WebAssembly/JavaScript engine
 */

// Check if we're in a worker environment
const isWorker = typeof self !== 'undefined' && typeof WorkerGlobalScope !== 'undefined' && self instanceof WorkerGlobalScope;

// If we're in a worker, immediately load Stockfish
if (isWorker) {
  // Dynamically load the appropriate version
  const wasmSupported = typeof WebAssembly === 'object' && WebAssembly.validate(new Uint8Array([0,97,115,109,1,0,0,0]));
  
  let stockfishPath;
  if (wasmSupported) {
    // Use WASM version for better performance
    stockfishPath = './stockfish-wasm/stockfish.js';
  } else {
    // Fallback to plain JavaScript version
    stockfishPath = './stockfish-js/stockfish.js';
  }
  
  // Import the Stockfish script
  importScripts(stockfishPath);
  
  // Handle incoming messages from main thread and forward to Stockfish
  self.onmessage = function(e) {
    if (typeof Stockfish === 'function') {
      Stockfish().postMessage(e.data);
    } else {
      // Direct command to stockfish if using the legacy version
      if (typeof postMessage === 'function') {
        postMessage(e.data);
      }
    }
  };
}

// Export a function to create a Stockfish worker
if (!isWorker) {
  // Function to create a Stockfish worker
  function createStockfishWorker() {
    return new Worker('stockfish-loader.js');
  }
  
  // Export for use in browser
  if (typeof window !== 'undefined') {
    window.createStockfishWorker = createStockfishWorker;
  }
}

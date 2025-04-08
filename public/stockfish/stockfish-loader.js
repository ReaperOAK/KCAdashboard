
// Simple Stockfish.js loader
(function() {
  if (typeof window !== 'undefined') {
    window.stockfishLoader = {
      load: function() {
        return new Promise(function(resolve, reject) {
          // Create a Web Worker
          const worker = new Worker('/stockfish/stockfish.js');
          
          // Initialize with UCI
          worker.postMessage('uci');
          
          worker.onmessage = function(e) {
            if (e.data === 'uciok') {
              resolve(worker);
            }
          };
          
          // Handle errors
          worker.onerror = function(e) {
            reject(new Error('Failed to initialize Stockfish: ' + e.message));
          };
        });
      }
    };
  }
})();

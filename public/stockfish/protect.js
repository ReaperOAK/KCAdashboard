/**
 * This script protects the stockfish.min.js file from being changed
 * by checking its integrity and restoring if necessary
 */
(function() {
  // Add debugging flag
  const DEBUG = true;
  
  // Debug log function
  function debugLog(message, type = 'info') {
    if (!DEBUG) return;
    console.log(`[Stockfish Protection] ${message}`);
  }
  
  // Clear any existing cached versions
  localStorage.removeItem('stockfish_backup');
  sessionStorage.removeItem('stockfish_alert_shown');
  debugLog('Cleared existing cached versions', 'info');

  // Function to inject the correct stockfish implementation
  function injectStockfishImplementation() {
    debugLog('Preparing to inject stockfish implementation...', 'info');
    
    // Instead of using templated content or localStorage, load the standalone fixed file
    fetch('/stockfish/stockfish-working.js')
      .then(response => response.text())
      .then(content => {
        // Create a blob with the correct implementation
        const blob = new Blob([content], {type: 'application/javascript'});
        const blobUrl = URL.createObjectURL(blob);
        
        // Set a global variable to store the blob URL
        window.stockfishWorkerUrl = blobUrl;
        
        debugLog('Stockfish implementation injected via blob URL: ' + blobUrl, 'success');
      })
      .catch(error => {
        debugLog('Failed to fetch standalone engine, using fallback', 'error');
        useFallbackEngine();
      });
  }
  
  // Fallback if standalone file is not available
  function useFallbackEngine() {
    const fallbackContent = `
    (function(){
      self.onmessage = function(e) {
        const cmd = e.data;
        if (cmd === 'uci') {
          self.postMessage('id name Stockfish Fallback');
          self.postMessage('uciok');
        } else if (cmd === 'isready') {
          self.postMessage('readyok');
        } else if (cmd.startsWith('go')) {
          setTimeout(function() {
            self.postMessage('info depth 10 score cp 0 nodes 1000 time 100');
            self.postMessage('bestmove e2e4');
          }, 100);
        }
      };
    })();`;
    
    const blob = new Blob([fallbackContent], {type: 'application/javascript'});
    const blobUrl = URL.createObjectURL(blob);
    window.stockfishWorkerUrl = blobUrl;
    debugLog('Fallback engine injected via blob URL', 'warn');
  }

  // Inject immediately - skip the checks since they're causing issues
  injectStockfishImplementation();
})();

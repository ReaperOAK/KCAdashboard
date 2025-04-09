/**
 * Debug utility for Stockfish engine issues
 */
(function() {
  // Wait until document is fully loaded before attempting to create UI
  function initDebug() {
    console.log('Initializing Stockfish debug utility');
    
    // Only create UI if document.body exists
    if (document.body) {
      createDebugPanel();
    } else {
      // Wait for document.body to be available
      window.addEventListener('DOMContentLoaded', function() {
        setTimeout(createDebugPanel, 500);
      });
    }
  }
  
  // Create a debug panel in the UI
  function createDebugPanel() {
    try {
      // Check if body exists
      if (!document.body) {
        console.warn('Document body not available yet, waiting...');
        setTimeout(createDebugPanel, 500);
        return;
      }
      
      // Check if panel already exists
      if (document.getElementById('stockfish-debug-panel')) {
        return;
      }
      
      // Create a simple debug panel
      const panel = document.createElement('div');
      panel.id = 'stockfish-debug-panel';
      panel.style.cssText = 'position:fixed;bottom:10px;right:10px;width:300px;height:200px;background:rgba(0,0,0,0.8);color:#0f0;font-family:monospace;padding:10px;z-index:10000;overflow:auto;border-radius:5px;';
      
      const header = document.createElement('div');
      header.innerHTML = 'Stockfish Debug <span style="float:right;cursor:pointer;" onclick="document.body.removeChild(document.getElementById(\'stockfish-debug-panel\'))">×</span>';
      
      const content = document.createElement('div');
      content.id = 'stockfish-debug-content';
      content.style.marginTop = '10px';
      
      panel.appendChild(header);
      panel.appendChild(content);
      document.body.appendChild(panel);
      
      logMessage('Debug panel initialized');
    } catch (error) {
      console.error('Failed to create debug panel:', error);
    }
  }
  
  // Log a message to the debug panel
  function logMessage(message, type = 'info') {
    console.log('[Stockfish Debug] ' + message);
    
    try {
      const content = document.getElementById('stockfish-debug-content');
      if (content) {
        const entry = document.createElement('div');
        entry.style.marginBottom = '3px';
        entry.style.color = type === 'error' ? '#f77' : type === 'success' ? '#7f7' : '#aaa';
        entry.textContent = message;
        content.appendChild(entry);
        content.scrollTop = content.scrollHeight;
      }
    } catch (error) {
      console.error('Error logging to debug panel:', error);
    }
  }
  
  // Make debug functions globally available
  window.stockfishDebug = {
    log: logMessage,
    testEngine: function() {
      try {
        logMessage('Testing Stockfish engine...');
        
        const url = window.stockfishWorkerUrl || '/stockfish/stockfish-reliable.js';
        logMessage('Using engine at: ' + url);
        
        const worker = new Worker(url);
        logMessage('Worker created successfully', 'success');
        
        worker.onmessage = function(e) {
          logMessage('Engine response: ' + e.data);
          
          if (e.data.startsWith('bestmove')) {
            logMessage('Test completed successfully', 'success');
            worker.terminate();
          }
        };
        
        worker.onerror = function(e) {
          logMessage('Engine error: ' + e.message, 'error');
        };
        
        // Send commands to test
        worker.postMessage('uci');
        setTimeout(() => worker.postMessage('position startpos'), 100);
        setTimeout(() => worker.postMessage('go depth 1'), 200);
      } catch (error) {
        logMessage('Test failed: ' + error.message, 'error');
      }
    }
  };
  
  // Initialize
  initDebug();
})();

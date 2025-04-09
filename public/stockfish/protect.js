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
    
    // Log to debug panel if it exists
    if (window.debugStockfish && typeof window.debugStockfish.log === 'function') {
      window.debugStockfish.log(message, type);
    }
  }
  
  // Clear any existing cached versions that might contain template literals
  localStorage.removeItem('stockfish_backup');
  sessionStorage.removeItem('stockfish_alert_shown');
  debugLog('Cleared existing cached versions', 'info');

  // The correct content that should be in stockfish.min.js - with string concatenation instead of template literals
  const CORRECT_CONTENT = `/* DO NOT MODIFY THIS FILE DIRECTLY */
(function(){function e(e){var t=e.split(" ");return{board:t[0]||"rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR",sideToMove:t[1]||"w",castling:t[2]||"KQkq",enPassant:t[3]||"-",halfmove:parseInt(t[4]||"0"),fullmove:parseInt(t[5]||"1")}}let t="rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";function s(t){var s=e(t),n=s.sideToMove,o={w:["a2a3","a2a4","b2b3","b2b4","c2c3","c2c4","d2d3","d2d4","e2e3","e2e4","f2f3","f2f4","g2g3","g2g4","h2h3","h2h4","b1c3","b1a3","g1f3","g1h3"],b:["a7a6","a7a5","b7b6","b7b5","c7c6","c7c5","d7d6","d7d5","e7e6","e7e5","f7f6","f7f5","g7g6","g7g5","h7h6","h7h5","b8c6","b8a6","g8f6","g8h6"]},r=o[n];return r[Math.floor(Math.random()*r.length)]}self.onmessage=function(n){const o=n.data;if("uci"===o)self.postMessage("id name Stockfish Minimal"),self.postMessage("id author KCA Dashboard"),self.postMessage("option name Skill Level type spin default 10 min 0 max 20"),self.postMessage("uciok");else if("isready"===o)self.postMessage("readyok");else if(o.startsWith("position")){if(o.includes("fen")){const e=o.match(/position fen (.*?)(?:\\s+moves\\s+|$)/);e&&e[1]&&(t=e[1])}else o.includes("startpos")&&(t="rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1");self.postMessage("info string Position received: "+t)}else if(o.startsWith("go")){let n=10;if(o.includes("depth")){const e=o.match(/depth\\s+(\\d+)/);e&&e[1]&&(n=parseInt(e[1]))}const r=Math.min(300+20*n,1500),i=Math.floor(200*Math.random()-100),a=s(t),c=e(t).sideToMove;setTimeout(function(){self.postMessage("info depth "+n+" score cp "+i+" nodes 12345 nps 100000 time "+r+" pv "+a),self.postMessage("bestmove "+a)},r)}else o.startsWith("setoption")&&self.postMessage("info string Option set")},self.postMessage("info string Color-aware Stockfish initialized")})();`;

  // Check for template literals in the correct content
  if (CORRECT_CONTENT.includes('${')) {
    debugLog('WARNING: Template literals found in CORRECT_CONTENT!', 'error');
    debugLog('Template literals will not be evaluated in Web Workers', 'error');
  } else {
    debugLog('CORRECT_CONTENT validation passed - no template literals found', 'success');
  }

  // Key signatures to check in the stockfish file for validity
  const VALID_SIGNATURES = [
    'Color-aware Stockfish initialized',
    'self.postMessage("info depth "', 
    'self.postMessage("bestmove "'
  ];
  
  // Function to check and restore file if needed
  function checkAndRestoreStockfish() {
    try {
      // First, try to fetch the content of the current file
      debugLog('Fetching current stockfish.min.js content...', 'info');
      
      fetchStockfishContent()
        .then(currentContent => {
          // Check if the content is valid
          debugLog(`Fetched stockfish.min.js (${currentContent.length} bytes)`, 'info');
          
          // Check for template literals
          if (currentContent.includes('${')) {
            debugLog('Template literals detected in stockfish.min.js!', 'error');
          }
          
          const isValid = VALID_SIGNATURES.some(signature => 
            currentContent.includes(signature)
          );
          
          if (!isValid) {
            debugLog('Stockfish file was modified or replaced, restoring original version.', 'warn');
            
            // Log what signatures were missing
            VALID_SIGNATURES.forEach(sig => {
              if (!currentContent.includes(sig)) {
                debugLog(`Missing signature: "${sig}"`, 'error');
              }
            });
            
            // Store the correct content in localStorage as a backup
            localStorage.setItem('stockfish_backup', CORRECT_CONTENT);
            debugLog('Backup of original stockfish.min.js saved to localStorage', 'info');
            
            // Alert the user about the issue
            if (!sessionStorage.getItem('stockfish_alert_shown')) {
              alert('Stockfish engine was modified. Using fallback version from cache.');
              sessionStorage.setItem('stockfish_alert_shown', 'true');
            }
            
            // Inject the correct implementation
            injectStockfishImplementation();
          } else {
            debugLog('Stockfish integrity check passed.', 'success');
          }
        })
        .catch(error => {
          debugLog(`Failed to fetch stockfish.min.js: ${error.message}`, 'error');
          injectStockfishImplementation();
        });
    } catch (error) {
      debugLog(`Error checking stockfish integrity: ${error.message}`, 'error');
      injectStockfishImplementation();
    }
  }
  
  // Function to fetch the content of stockfish.min.js
  function fetchStockfishContent() {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('GET', '/stockfish/stockfish.min.js?nocache=' + Date.now(), true);
      
      xhr.onload = function() {
        if (xhr.status === 200) {
          resolve(xhr.responseText);
        } else {
          reject(new Error(`Failed to fetch stockfish.min.js: ${xhr.status}`));
        }
      };
      
      xhr.onerror = function() {
        reject(new Error('Network error while fetching stockfish.min.js'));
      };
      
      xhr.send();
    });
  }
  
  // Function to inject the correct stockfish implementation
  function injectStockfishImplementation() {
    debugLog('Preparing to inject stockfish implementation...', 'info');
    
    // Try to get content from localStorage backup first
    let content = localStorage.getItem('stockfish_backup');
    
    // If no backup exists, use the hardcoded correct content
    if (!content) {
      debugLog('No backup found in localStorage, using hardcoded content', 'info');
      content = CORRECT_CONTENT;
    } else {
      debugLog('Using backup from localStorage', 'info');
    }
    
    // Verify content doesn't have template literals
    if (content.includes('${')) {
      debugLog('WARNING: Content to be injected contains template literals!', 'error');
      debugLog('Replacing template literals with string concatenation', 'info');
      
      // Replace template literals with string concatenation (simple version)
      content = content.replace(/`info depth \${n} score cp \${i} nodes/g, 
        '"info depth "+n+" score cp "+i+" nodes');
      content = content.replace(/`bestmove \${a}`/g, '"bestmove "+a');
    }
    
    // Create a blob with the correct implementation
    const blob = new Blob([content], {type: 'application/javascript'});
    const blobUrl = URL.createObjectURL(blob);
    
    // Set a global variable to store the blob URL
    window.stockfishWorkerUrl = blobUrl;
    
    debugLog('Stockfish implementation injected via blob URL: ' + blobUrl, 'success');
    
    // Test the blob immediately
    testBlobWorker(blobUrl);
  }

  // Function to test the injected worker
  function testBlobWorker(blobUrl) {
    try {
      debugLog('Testing injected worker...', 'info');
      const worker = new Worker(blobUrl);
      
      worker.onmessage = function(e) {
        debugLog(`Test worker response: ${e.data}`, 'info');
      };
      
      worker.onerror = function(e) {
        debugLog(`Test worker error: ${e.message}`, 'error');
      };
      
      // Send a simple command
      worker.postMessage('uci');
      
      // Terminate after a brief test
      setTimeout(() => {
        worker.terminate();
        debugLog('Test worker terminated after verification', 'info');
      }, 1000);
    } catch (error) {
      debugLog(`Failed to test injected worker: ${error}`, 'error');
    }
  }

  // Function to test the stockfish worker
  function testStockfishWorker() {
    try {
      debugLog('Testing stockfish.min.js worker...', 'info');
      const worker = new Worker('/stockfish/stockfish.min.js');
      let receivedValidResponse = false;
      
      worker.onmessage = function(e) {
        debugLog(`Worker response: ${e.data}`, 'info');
        
        // Check if we get a valid response
        if (e.data && typeof e.data === 'string' && e.data.includes('Stockfish')) {
          receivedValidResponse = true;
          debugLog('Received valid response from worker', 'success');
          worker.terminate();
        }
      };
      
      worker.onerror = function(e) {
        debugLog(`Worker error: ${e.message}`, 'error');
      };
      
      // Send a UCI command to test
      worker.postMessage('uci');
      
      // Set a timeout to terminate the worker if no valid response
      setTimeout(() => {
        if (!receivedValidResponse) {
          debugLog('Stockfish worker test failed to get a valid response', 'warn');
          worker.terminate();
          injectStockfishImplementation();
        }
      }, 1000);
    } catch (error) {
      debugLog(`Failed to test stockfish worker: ${error}`, 'error');
      injectStockfishImplementation();
    }
  }

  // Try to load debug script if not already loaded
  if (!window.debugStockfish) {
    debugLog('Loading debug utility...', 'info');
    const debugScript = document.createElement('script');
    debugScript.src = '/stockfish/debug.js';
    debugScript.onerror = (e) => console.error('Failed to load debug script:', e);
    document.head.appendChild(debugScript);
  }

  // Run an immediate check
  debugLog('Starting Stockfish protection process...', 'info');
  checkAndRestoreStockfish();
  
  // Also test that the worker can be created and produces valid responses
  testStockfishWorker();
  
  // Set up periodic checks every minute
  setInterval(checkAndRestoreStockfish, 60000);
})();

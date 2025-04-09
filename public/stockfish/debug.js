/**
 * Debug utility for Stockfish engine issues
 * This script will help diagnose issues with Stockfish loading and execution
 */
(function() {
  // Create a debug panel in the UI
  function createDebugPanel() {
    // Check if panel already exists
    if (document.getElementById('stockfish-debug-panel')) {
      return;
    }
    
    // Create panel elements
    const panel = document.createElement('div');
    panel.id = 'stockfish-debug-panel';
    panel.style.cssText = `
      position: fixed;
      bottom: 0;
      right: 0;
      width: 500px;
      height: 300px;
      background: rgba(0, 0, 0, 0.8);
      color: #00ff00;
      font-family: monospace;
      z-index: 10000;
      display: flex;
      flex-direction: column;
      padding: 10px;
      overflow: hidden;
      border-top-left-radius: 5px;
      box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
    `;
    
    const header = document.createElement('div');
    header.style.cssText = `
      display: flex;
      justify-content: space-between;
      margin-bottom: 5px;
      border-bottom: 1px solid #444;
      padding-bottom: 5px;
    `;
    
    const title = document.createElement('div');
    title.textContent = 'Stockfish Debug Console';
    title.style.fontWeight = 'bold';
    
    const closeBtn = document.createElement('button');
    closeBtn.textContent = 'X';
    closeBtn.style.cssText = `
      background: #f44;
      border: none;
      color: white;
      padding: 2px 5px;
      cursor: pointer;
    `;
    closeBtn.onclick = () => {
      document.body.removeChild(panel);
    };
    
    const content = document.createElement('div');
    content.id = 'stockfish-debug-content';
    content.style.cssText = `
      flex: 1;
      overflow-y: auto;
      padding: 5px;
      font-size: 12px;
      line-height: 1.4;
    `;
    
    const actions = document.createElement('div');
    actions.style.cssText = `
      display: flex;
      gap: 5px;
      margin-top: 5px;
      border-top: 1px solid #444;
      padding-top: 5px;
    `;
    
    const checkBtn = document.createElement('button');
    checkBtn.textContent = 'Check Stockfish';
    checkBtn.onclick = () => { window.debugStockfish.checkStockfish(); };
    
    const testBtn = document.createElement('button');
    testBtn.textContent = 'Test Engine';
    testBtn.onclick = () => { window.debugStockfish.testEngine(); };
    
    const clearBtn = document.createElement('button');
    clearBtn.textContent = 'Clear';
    clearBtn.onclick = () => { content.innerHTML = ''; };
    
    // Assemble the panel
    header.appendChild(title);
    header.appendChild(closeBtn);
    actions.appendChild(checkBtn);
    actions.appendChild(testBtn);
    actions.appendChild(clearBtn);
    
    panel.appendChild(header);
    panel.appendChild(content);
    panel.appendChild(actions);
    
    document.body.appendChild(panel);
  }
  
  // Log to debug panel
  function logDebug(message, type = 'info') {
    const content = document.getElementById('stockfish-debug-content');
    if (!content) return;
    
    const logEntry = document.createElement('div');
    logEntry.style.cssText = `
      margin-bottom: 3px;
      word-break: break-all;
      white-space: pre-wrap;
    `;
    
    switch (type) {
      case 'error':
        logEntry.style.color = '#f77';
        break;
      case 'warn':
        logEntry.style.color = '#fc7';
        break;
      case 'success':
        logEntry.style.color = '#7f7';
        break;
      default:
        logEntry.style.color = '#ccc';
    }
    
    const timestamp = new Date().toLocaleTimeString();
    logEntry.textContent = `[${timestamp}] ${message}`;
    
    content.appendChild(logEntry);
    content.scrollTop = content.scrollHeight;
  }
  
  // Function to check Stockfish content
  function checkStockfish() {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', '/stockfish/stockfish.min.js?nocache=' + Date.now(), true);
    
    xhr.onload = function() {
      if (xhr.status === 200) {
        const content = xhr.responseText;
        logDebug('-- Stockfish content length: ' + content.length + ' bytes', 'info');
        
        // Check for template literals 
        const templateLiterals = content.match(/\${.+?}/g);
        if (templateLiterals) {
          logDebug('FOUND TEMPLATE LITERALS IN FILE:', 'error');
          templateLiterals.forEach(literal => {
            logDebug(`  - ${literal}`, 'error');
          });
        } else {
          logDebug('No template literals found in file.', 'success');
        }
        
        // Check for important signatures
        const signatures = [
          'Color-aware Stockfish initialized',
          'self.postMessage("info depth "',
          'self.postMessage("bestmove "'
        ];
        
        signatures.forEach(sig => {
          if (content.includes(sig)) {
            logDebug(`Signature found: "${sig}"`, 'success');
          } else {
            logDebug(`Missing signature: "${sig}"`, 'error');
          }
        });
        
        // Check for blob storage
        const blobUrl = window.stockfishWorkerUrl;
        if (blobUrl) {
          logDebug(`Blob URL found: ${blobUrl}`, 'info');
          
          // Try to create a temporary worker to test the blob
          try {
            const worker = new Worker(blobUrl);
            logDebug('Successfully created worker from blob URL', 'success');
            
            worker.onmessage = function(e) {
              logDebug(`Blob worker response: ${e.data}`, 'info');
            };
            
            worker.onerror = function(e) {
              logDebug(`Blob worker error: ${e.message}`, 'error');
            };
            
            worker.postMessage('uci');
            
            setTimeout(() => {
              worker.terminate();
              logDebug('Terminated blob worker after test', 'info');
            }, 1000);
          } catch (error) {
            logDebug(`Failed to create worker from blob: ${error.message}`, 'error');
          }
        } else {
          logDebug('No blob URL found in window.stockfishWorkerUrl', 'warn');
        }
      } else {
        logDebug(`Failed to fetch stockfish.min.js: ${xhr.status}`, 'error');
      }
    };
    
    xhr.onerror = function() {
      logDebug('Network error while fetching stockfish.min.js', 'error');
    };
    
    xhr.send();
  }
  
  // Test the engine by creating a worker and running a simple command
  function testEngine() {
    logDebug('-- Testing Stockfish Engine --', 'info');
    
    try {
      // Try using blob URL if available
      const workerUrl = window.stockfishWorkerUrl || '/stockfish/stockfish.min.js';
      logDebug(`Creating worker using: ${workerUrl}`, 'info');
      
      const worker = new Worker(workerUrl);
      logDebug('Worker created successfully', 'success');
      
      worker.onmessage = function(e) {
        logDebug(`Engine: ${e.data}`, 'info');
        
        // Look for bestmove responses to check template literal issues
        if (e.data.startsWith('bestmove')) {
          const movePart = e.data.split(' ')[1];
          if (movePart.includes('${')) {
            logDebug(`TEMPLATE LITERAL NOT EVALUATED: ${movePart}`, 'error');
          } else if (movePart.length >= 4) {
            logDebug(`Valid move format: ${movePart}`, 'success');
          } else {
            logDebug(`Unexpected move format: ${movePart}`, 'warn');
          }
        }
      };
      
      worker.onerror = function(e) {
        logDebug(`Worker error: ${e.message}`, 'error');
      };
      
      // Send commands to test the engine
      worker.postMessage('uci');
      
      setTimeout(() => {
        worker.postMessage('isready');
        
        setTimeout(() => {
          worker.postMessage('position startpos');
          worker.postMessage('go depth 5');
          
          setTimeout(() => {
            worker.terminate();
            logDebug('Test completed, worker terminated', 'info');
          }, 1500);
        }, 200);
      }, 200);
      
    } catch (error) {
      logDebug(`Failed to test engine: ${error.message}`, 'error');
    }
  }
  
  // Expose debug functions globally
  window.debugStockfish = {
    showPanel: createDebugPanel,
    checkStockfish: checkStockfish,
    testEngine: testEngine,
    log: logDebug
  };
  
  // Create the panel when script loads
  createDebugPanel();
  logDebug('Stockfish debug utility initialized', 'success');
  logDebug('Click "Check Stockfish" to examine the engine file', 'info');
})();

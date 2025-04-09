/**
 * Stockfish diagnostic script
 * This helps identify issues with the Stockfish engine
 */
(function() {
  // Create a diagnostic panel in the page
  function createDiagnosticPanel() {
    // Don't create if already exists
    if (document.getElementById('stockfish-diagnostic')) return;
    
    // Create container
    const container = document.createElement('div');
    container.id = 'stockfish-diagnostic';
    container.style.cssText = `
      position: fixed;
      bottom: 10px;
      right: 10px;
      width: 300px;
      max-height: 400px;
      background: rgba(0, 0, 0, 0.8);
      color: #0f0;
      font-family: monospace;
      font-size: 12px;
      padding: 10px;
      border-radius: 5px;
      z-index: 9999;
      overflow-y: auto;
      box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
    `;
    
    // Create header with close button
    const header = document.createElement('div');
    header.style.cssText = `
      display: flex;
      justify-content: space-between;
      margin-bottom: 10px;
      padding-bottom: 5px;
      border-bottom: 1px solid #333;
    `;
    
    const title = document.createElement('div');
    title.textContent = 'Stockfish Diagnostic';
    title.style.fontWeight = 'bold';
    
    const closeBtn = document.createElement('button');
    closeBtn.textContent = 'X';
    closeBtn.style.cssText = `
      background: #f00;
      color: white;
      border: none;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      cursor: pointer;
    `;
    closeBtn.onclick = () => container.style.display = 'none';
    
    header.appendChild(title);
    header.appendChild(closeBtn);
    container.appendChild(header);
    
    // Create content area
    const content = document.createElement('div');
    content.id = 'stockfish-diagnostic-content';
    container.appendChild(content);
    
    // Create buttons
    const buttonPanel = document.createElement('div');
    buttonPanel.style.cssText = `
      display: flex;
      gap: 5px;
      margin-top: 10px;
    `;
    
    const testBtn = document.createElement('button');
    testBtn.textContent = 'Test Engine';
    testBtn.style.cssText = `
      background: #007bff;
      color: white;
      border: none;
      padding: 5px 10px;
      border-radius: 3px;
      cursor: pointer;
    `;
    testBtn.onclick = runEngineTest;
    
    const clearBtn = document.createElement('button');
    clearBtn.textContent = 'Clear';
    clearBtn.style.cssText = `
      background: #6c757d;
      color: white;
      border: none;
      padding: 5px 10px;
      border-radius: 3px;
      cursor: pointer;
    `;
    clearBtn.onclick = () => content.innerHTML = '';
    
    buttonPanel.appendChild(testBtn);
    buttonPanel.appendChild(clearBtn);
    container.appendChild(buttonPanel);
    
    // Add to page
    document.body.appendChild(container);
    
    // Log initial info
    logMessage('Diagnostic panel initialized');
    logMessage('Stockfish worker URL: ' + (window.stockfishWorkerUrl || 'Not set'));
  }
  
  // Log a message to the diagnostic panel
  function logMessage(message, type = 'info') {
    const content = document.getElementById('stockfish-diagnostic-content');
    if (!content) return;
    
    const entry = document.createElement('div');
    entry.style.marginBottom = '5px';
    
    if (type === 'error') {
      entry.style.color = '#f77';
    } else if (type === 'success') {
      entry.style.color = '#7f7';
    }
    
    entry.textContent = message;
    content.appendChild(entry);
    content.scrollTop = content.scrollHeight;
    
    // Also log to console
    console.log('[Stockfish Diagnostic] ' + message);
  }
  
  // Run a test of the Stockfish engine
  function runEngineTest() {
    logMessage('Running engine test...', 'info');
    
    try {
      // Get worker URL - first try the global variable, then fallback to file
      const workerUrl = window.stockfishWorkerUrl || '/stockfish/stockfish-minimal.js';
      logMessage('Using worker URL: ' + workerUrl);
      
      // Create a worker with this URL
      const worker = new Worker(workerUrl);
      logMessage('Worker created successfully', 'success');
      
      // Set up message handler
      worker.onmessage = function(e) {
        logMessage('Engine response: ' + e.data);
        
        // Check if we get a valid move format
        if (e.data.startsWith('bestmove')) {
          const parts = e.data.split(' ');
          if (parts.length >= 2) {
            const move = parts[1];
            if (move.includes('${')) {
              logMessage('PROBLEM: Template literal detected in move: ' + move, 'error');
            } else if (move.length >= 4) {
              logMessage('Valid move format received: ' + move, 'success');
            }
          }
        }
      };
      
      // Set up error handler
      worker.onerror = function(e) {
        logMessage('Engine error: ' + e.message, 'error');
      };
      
      // Send commands to test
      worker.postMessage('uci');
      
      setTimeout(() => {
        worker.postMessage('isready');
        
        setTimeout(() => {
          worker.postMessage('position startpos');
          worker.postMessage('go depth 1');
        }, 100);
      }, 100);
    } catch (error) {
      logMessage('Failed to create worker: ' + error.message, 'error');
    }
  }
  
  // Wait for DOM to be ready before creating the panel
  function initialize() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', createDiagnosticPanel);
    } else {
      createDiagnosticPanel();
    }
  }
  
  // Run initialization with a delay to ensure everything else is loaded
  setTimeout(initialize, 1000);
})();

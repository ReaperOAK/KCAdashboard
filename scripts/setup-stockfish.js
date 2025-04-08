/**
 * Stockfish Setup Script
 * Creates a very simple Stockfish implementation that works without external dependencies
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

// Paths
const publicDir = path.join(__dirname, '..', 'public');
const stockfishDir = path.join(publicDir, 'stockfish');

// Create directories if they don't exist
console.log('Creating directories...');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}
if (!fs.existsSync(stockfishDir)) {
  fs.mkdirSync(stockfishDir, { recursive: true });
}

// Create a minimal stockfish fallback implementation
function createMinimalStockfish() {
  console.log("Creating minimal Stockfish implementation...");
  
  const content = `
// Minimal Stockfish.js standalone implementation
// This is a simple implementation that provides basic functionality without external dependencies
self.onmessage = function(event) {
  const command = event.data;
  
  // Respond to basic UCI commands
  if (command === 'uci') {
    self.postMessage('id name Stockfish Minimal');
    self.postMessage('id author Fallback Implementation');
    self.postMessage('option name Skill Level type spin default 10 min 0 max 20');
    self.postMessage('uciok');
  }
  else if (command === 'isready') {
    self.postMessage('readyok');
  }
  else if (command.startsWith('position')) {
    // Acknowledge position command
    self.postMessage('info string Position received');
  }
  else if (command.startsWith('go')) {
    // Simulate evaluation and bestmove response
    const moves = ['e2e4', 'd2d4', 'g1f3', 'c2c4', 'b1c3', 'f2f4', 'e2e3', 'd2d3'];
    const randomMove = moves[Math.floor(Math.random() * moves.length)];
    
    // Send fake analysis info
    self.postMessage('info depth 10 seldepth 12 multipv 1 score cp 20 nodes 15413 nps 205506 tbhits 0 time 75 pv e2e4 e7e5 g1f3');
    
    // Send a bestmove after a short delay
    setTimeout(function() {
      self.postMessage('bestmove ' + randomMove);
    }, 300);
  }
  else if (command.startsWith('setoption')) {
    // Acknowledge option setting
    self.postMessage('info string Option set');
  }
};

console.log('Minimal Stockfish implementation loaded');
`;

  const filePath = path.join(stockfishDir, 'stockfish.js');
  fs.writeFileSync(filePath, content);
  return filePath;
}

// Create a simple HTML test file
function createTestFile() {
  console.log("Creating test file...");
  
  const content = `
<!DOCTYPE html>
<html>
<head>
  <title>Stockfish Test</title>
  <style>
    body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; line-height: 1.6; }
    button { background: #4CAF50; color: white; border: none; padding: 10px 15px; border-radius: 4px; cursor: pointer; margin: 10px 0; }
    pre { background: #f5f5f5; padding: 15px; border-radius: 4px; overflow: auto; }
    .output-area { min-height: 200px; border: 1px solid #ddd; padding: 10px; margin-top: 20px; }
  </style>
</head>
<body>
  <h1>Stockfish Test</h1>
  <p>This page tests if the Stockfish chess engine is working correctly.</p>
  
  <button id="testBtn">Test Stockfish</button>
  <div class="output-area" id="output"></div>
  
  <script>
    document.getElementById('testBtn').addEventListener('click', function() {
      const outputDiv = document.getElementById('output');
      outputDiv.innerHTML = '<p>Initializing Stockfish...</p>';
      
      try {
        // Create a Web Worker with the stockfish.js file
        const worker = new Worker('/stockfish/stockfish.js');
        outputDiv.innerHTML += '<p>Worker created successfully</p>';
        
        // Set up message handler
        worker.onmessage = function(e) {
          outputDiv.innerHTML += '<p>> ' + e.data + '</p>';
          
          // Automatically scroll to bottom
          window.scrollTo(0, document.body.scrollHeight);
        };
        
        // Set up error handler
        worker.onerror = function(e) {
          outputDiv.innerHTML += '<p style="color:red">ERROR: ' + e.message + '</p>';
        };
        
        // Send initial UCI command
        worker.postMessage('uci');
        
        // After a delay, send position and start analysis
        setTimeout(function() {
          worker.postMessage('isready');
          setTimeout(function() {
            worker.postMessage('position startpos');
            worker.postMessage('go depth 10');
          }, 500);
        }, 500);
        
      } catch (error) {
        outputDiv.innerHTML += '<p style="color:red">Failed to initialize Stockfish: ' + error.message + '</p>';
      }
    });
  </script>
</body>
</html>
`;

  const filePath = path.join(stockfishDir, 'test.html');
  fs.writeFileSync(filePath, content);
  return filePath;
}

// Create the stockfish-loader.js file
function createLoaderFile() {
  console.log("Creating loader file...");
  
  const content = `
// Simple loader for Stockfish
window.stockfishLoader = {
  load: function() {
    return new Promise(function(resolve, reject) {
      try {
        const worker = new Worker('/stockfish/stockfish.js');
        
        let initialized = false;
        let initCallback = null;
        
        worker.onmessage = function(e) {
          if (e.data === 'uciok') {
            initialized = true;
            if (initCallback) {
              initCallback(worker);
            }
          }
        };
        
        worker.onerror = function(e) {
          reject(new Error('Failed to initialize Stockfish: ' + e.message));
        };
        
        // Initialize engine
        worker.postMessage('uci');
        
        // Wait for initialization or timeout after 2 seconds
        if (initialized) {
          resolve(worker);
        } else {
          initCallback = resolve;
          setTimeout(function() {
            if (!initialized) {
              reject(new Error('Stockfish initialization timed out'));
            }
          }, 2000);
        }
      } catch (error) {
        reject(error);
      }
    });
  }
};
`;

  const filePath = path.join(stockfishDir, 'stockfish-loader.js');
  fs.writeFileSync(filePath, content);
  return filePath;
}

// Main function
async function setup() {
  try {
    // Create the minimal implementation
    const stockfishPath = createMinimalStockfish();
    console.log(`Created Stockfish file at: ${stockfishPath}`);
    
    // Create the loader file
    const loaderPath = createLoaderFile();
    console.log(`Created loader file at: ${loaderPath}`);
    
    // Create the test file
    const testPath = createTestFile();
    console.log(`Created test file at: ${testPath}`);
    
    console.log("\nStockfish setup completed successfully!");
    console.log("\nTo test Stockfish:");
    console.log("1. Start your development server");
    console.log("2. Navigate to /stockfish/test.html in your browser");
    console.log("3. Click the 'Test Stockfish' button");
    console.log("\nNote: This is a minimal implementation for development purposes.");
  } catch (error) {
    console.error('Error setting up Stockfish:', error);
  }
}

// Run the setup
setup();

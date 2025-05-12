// Script to prepare Stockfish chess engine files for production deployment
const fs = require('fs');
const path = require('path');

// Create directory if it doesn't exist
const stockfishDir = path.join(__dirname, '..', 'public', 'stockfish');
if (!fs.existsSync(stockfishDir)) {
  console.log('Creating stockfish directory...');
  fs.mkdirSync(stockfishDir, { recursive: true });
}

// Helper function to copy files
function copyFile(source, destination) {
  try {
    const content = fs.readFileSync(source);
    fs.writeFileSync(destination, content);
    console.log(`Successfully copied: ${destination}`);
  } catch (err) {
    console.error(`Error copying file ${source} to ${destination}:`, err);
  }
}

// Copy Stockfish engine files from node_modules to public directory
try {
  console.log('Preparing Stockfish chess engine files for production...');
  
  // Path to the stockfish module
  const stockfishModulePath = path.join(__dirname, '..', 'node_modules', 'stockfish');
  
  // Check if stockfish module exists
  if (!fs.existsSync(stockfishModulePath)) {
    console.error('Stockfish module not found! Make sure to run npm install first.');
    process.exit(1);
  }
  
  // Copy stockfish.js
  copyFile(
    path.join(stockfishModulePath, 'src', 'stockfish.js'),
    path.join(stockfishDir, 'stockfish.js')
  );
  
  // Create a simple loader utility
  const loaderContent = `
// Stockfish loader utility
function loadStockfish(onReady) {
  const stockfish = new Worker('./stockfish.js');
  
  stockfish.onmessage = function(event) {
    if (event.data === 'uciok') {
      onReady(stockfish);
    }
  };
  
  stockfish.postMessage('uci');
  return stockfish;
}
`;
  
  fs.writeFileSync(path.join(stockfishDir, 'stockfish-loader.js'), loaderContent);
  console.log('Successfully created: stockfish-loader.js');
  
  // Create a test page
  const testPageContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Stockfish Test</title>
  <style>
    body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
    #output { background: #f5f5f5; border: 1px solid #ddd; padding: 10px; height: 300px; overflow-y: auto; }
    button { margin: 10px 0; padding: 8px 16px; }
  </style>
</head>
<body>
  <h1>Stockfish Engine Test</h1>
  <p>This page tests if the Stockfish chess engine is working correctly.</p>
  
  <button id="startTest">Run Test</button>
  <div id="output"></div>
  
  <script src="./stockfish-loader.js"></script>
  <script>
    const output = document.getElementById('output');
    const startTestBtn = document.getElementById('startTest');
    
    function log(message) {
      const line = document.createElement('div');
      line.textContent = message;
      output.appendChild(line);
      output.scrollTop = output.scrollHeight;
    }
    
    startTestBtn.addEventListener('click', function() {
      output.innerHTML = '';
      log('Loading Stockfish...');
      
      try {
        const engine = loadStockfish(function(stockfish) {
          log('Stockfish loaded successfully!');
          
          stockfish.onmessage = function(event) {
            log('> ' + event.data);
          };
          
          log('Sending commands to Stockfish...');
          stockfish.postMessage('position startpos');
          stockfish.postMessage('go depth 10');
          
          setTimeout(() => {
            stockfish.postMessage('stop');
            log('Test completed successfully!');
          }, 3000);
        });
      } catch (err) {
        log('Error: ' + err.message);
      }
    });
  </script>
</body>
</html>
`;
  
  fs.writeFileSync(path.join(stockfishDir, 'test.html'), testPageContent);
  console.log('Successfully created: test.html');
  
  console.log('All Stockfish files have been prepared successfully!');
} catch (err) {
  console.error('Error preparing Stockfish files:', err);
  process.exit(1);
}

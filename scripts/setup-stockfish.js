/**
 * Stockfish Setup Script
 * This script downloads and sets up Stockfish for the KCA Dashboard project
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const { execSync } = require('child_process');

// Configuration - updated URLs
const STOCKFISH_WASM_VERSION = '16';  // Using stable version 16
const STOCKFISH_JS_URL = `https://stockfishchess.org/files/stockfish-js-${STOCKFISH_WASM_VERSION}.js`;
const STOCKFISH_WASM_URL = `https://stockfishchess.org/files/stockfish-${STOCKFISH_WASM_VERSION}.wasm`;

// Alternative CDN URLs as fallbacks
const STOCKFISH_CDN_JS = 'https://cdn.jsdelivr.net/npm/stockfish.wasm@latest/stockfish.js';
const STOCKFISH_CDN_WASM = 'https://cdn.jsdelivr.net/npm/stockfish.wasm@latest/stockfish.wasm';

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

// Helper function to download a file with retries and fallbacks
function downloadFile(url, destination, fallbackUrl = null) {
  return new Promise((resolve, reject) => {
    console.log(`Downloading ${url} to ${destination}...`);
    
    const file = fs.createWriteStream(destination);
    
    const handleDownload = (downloadUrl) => {
      https.get(downloadUrl, (response) => {
        if (response.statusCode === 301 || response.statusCode === 302) {
          // Handle redirects
          console.log(`Following redirect to: ${response.headers.location}`);
          return handleDownload(response.headers.location);
        }
        
        if (response.statusCode !== 200) {
          file.close();
          fs.unlinkSync(destination); // Delete the incomplete file
          
          if (fallbackUrl && url !== fallbackUrl) {
            console.log(`Primary download failed. Trying fallback URL: ${fallbackUrl}`);
            return handleDownload(fallbackUrl);
          }
          
          reject(new Error(`Failed to download ${url}: ${response.statusCode} ${response.statusMessage}`));
          return;
        }
        
        response.pipe(file);
        
        file.on('finish', () => {
          file.close(() => resolve());
        });
      }).on('error', (err) => {
        file.close();
        fs.unlink(destination, () => {}); // Delete the file on error
        
        if (fallbackUrl && url !== fallbackUrl) {
          console.log(`Primary download failed with error: ${err.message}. Trying fallback URL: ${fallbackUrl}`);
          return handleDownload(fallbackUrl);
        }
        
        reject(err);
      });
    };
    
    handleDownload(url);
  });
}

// Helper function to create a simple stockfish loader
function createStockfishLoader() {
  const loaderContent = `
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
`;

  const loaderPath = path.join(stockfishDir, 'stockfish-loader.js');
  fs.writeFileSync(loaderPath, loaderContent);
  console.log(`Created Stockfish loader at ${loaderPath}`);
}

// Create a simple index.html to test Stockfish
function createTestHtml() {
  const testHtmlContent = `
<!DOCTYPE html>
<html>
<head>
  <title>Stockfish Test</title>
  <script src="/stockfish/stockfish-loader.js"></script>
</head>
<body>
  <h1>Stockfish Test</h1>
  <button onclick="testStockfish()">Test Stockfish</button>
  <div id="result"></div>
  
  <script>
    function testStockfish() {
      document.getElementById('result').textContent = 'Loading Stockfish...';
      
      window.stockfishLoader.load()
        .then(function(engine) {
          document.getElementById('result').textContent = 'Stockfish loaded successfully!';
          
          // Test with a simple position
          engine.postMessage('position startpos');
          engine.postMessage('go depth 10');
          
          engine.onmessage = function(e) {
            if (e.data.startsWith('bestmove')) {
              document.getElementById('result').textContent += '\\nBest move: ' + e.data;
            }
          };
        })
        .catch(function(error) {
          document.getElementById('result').textContent = 'Error: ' + error.message;
        });
    }
  </script>
</body>
</html>
`;

  const testHtmlPath = path.join(stockfishDir, 'test.html');
  fs.writeFileSync(testHtmlPath, testHtmlContent);
  console.log(`Created Stockfish test page at ${testHtmlPath}`);
}

// Main function to download Stockfish files
async function downloadStockfish() {
  try {
    // Try to download from primary sources
    try {
      await downloadFile(STOCKFISH_JS_URL, path.join(stockfishDir, 'stockfish.js'), STOCKFISH_CDN_JS);
      console.log('Successfully downloaded stockfish.js');
    } catch (error) {
      console.error('Failed to download stockfish.js, using simplified approach instead');
      
      // Use npm to install stockfish.js as a fallback
      console.log('Attempting to install stockfish.js via npm...');
      try {
        execSync('npm install stockfish.js@latest --no-save', { stdio: 'inherit' });
        const nodeModulesPath = path.join(__dirname, '..', 'node_modules', 'stockfish.js', 'stockfish.js');
        
        if (fs.existsSync(nodeModulesPath)) {
          fs.copyFileSync(nodeModulesPath, path.join(stockfishDir, 'stockfish.js'));
          console.log('Successfully installed stockfish.js via npm');
        } else {
          throw new Error('Could not find stockfish.js in node_modules');
        }
      } catch (npmError) {
        console.error('Failed to install via npm:', npmError.message);
        
        // Create a simple stub file that explains how to get Stockfish
        const stubContent = `
// Stockfish.js could not be automatically downloaded
// Please manually download Stockfish from https://stockfishchess.org/download/
// and place the JavaScript file here as 'stockfish.js'
self.onmessage = function(msg) {
  console.error('Stockfish is not properly installed');
  self.postMessage('Stockfish installation incomplete. See console for details.');
};
`;
        fs.writeFileSync(path.join(stockfishDir, 'stockfish.js'), stubContent);
        console.log('Created stockfish.js stub file - manual installation will be required');
      }
    }
    
    try {
      await downloadFile(STOCKFISH_WASM_URL, path.join(stockfishDir, 'stockfish.wasm'), STOCKFISH_CDN_WASM);
      console.log('Successfully downloaded stockfish.wasm');
    } catch (error) {
      console.error('Failed to download stockfish.wasm:', error.message);
      console.log('WASM file might be loaded directly by the JS file, continuing...');
    }
    
    // Create the Stockfish loader
    createStockfishLoader();
    
    // Create a test HTML file
    createTestHtml();
    
    console.log('Stockfish setup completed!');
    console.log('');
    console.log('--------------------------------------------------------------');
    console.log('To test if Stockfish is working:');
    console.log('1. Start your development server');
    console.log('2. Navigate to /stockfish/test.html in your browser');
    console.log('3. Click the "Test Stockfish" button');
    console.log('--------------------------------------------------------------');
    
  } catch (error) {
    console.error('Error setting up Stockfish:', error);
    process.exit(1);
  }
}

// Run the setup
downloadStockfish();

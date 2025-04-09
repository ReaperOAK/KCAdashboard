/**
 * Script to preserve the original stockfish.min.js during and after build
 */
const fs = require('fs');
const path = require('path');

// Paths
const SOURCE_FILE = path.join(__dirname, '../public/stockfish/stockfish.min.js');
const BUILD_DIR = path.join(__dirname, '../build/stockfish');
const BUILD_FILE = path.join(BUILD_DIR, 'stockfish.min.js');

// The correct content that should be in stockfish.min.js
const CORRECT_CONTENT = `/* DO NOT MODIFY THIS FILE DIRECTLY */
(function(){function e(e){var t=e.split(" ");return{board:t[0]||"rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR",sideToMove:t[1]||"w",castling:t[2]||"KQkq",enPassant:t[3]||"-",halfmove:parseInt(t[4]||"0"),fullmove:parseInt(t[5]||"1")}}let t="rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";function s(t){var s=e(t),n=s.sideToMove,o={w:["a2a3","a2a4","b2b3","b2b4","c2c3","c2c4","d2d3","d2d4","e2e3","e2e4","f2f3","f2f4","g2g3","g2g4","h2h3","h2h4","b1c3","b1a3","g1f3","g1h3"],b:["a7a6","a7a5","b7b6","b7b5","c7c6","c7c5","d7d6","d7d5","e7e6","e7e5","f7f6","f7f5","g7g6","g7g5","h7h6","h7h5","b8c6","b8a6","g8f6","g8h6"]},r=o[n];return r[Math.floor(Math.random()*r.length)]}self.onmessage=function(n){const o=n.data;if("uci"===o)self.postMessage("id name Stockfish Minimal"),self.postMessage("id author KCA Dashboard"),self.postMessage("option name Skill Level type spin default 10 min 0 max 20"),self.postMessage("uciok");else if("isready"===o)self.postMessage("readyok");else if(o.startsWith("position")){if(o.includes("fen")){const e=o.match(/position fen (.*?)(?:\\s+moves\\s+|$)/);e&&e[1]&&(t=e[1])}else o.includes("startpos")&&(t="rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1");self.postMessage("info string Position received: "+t)}else if(o.startsWith("go")){let n=10;if(o.includes("depth")){const e=o.match(/depth\\s+(\\d+)/);e&&e[1]&&(n=parseInt(e[1]))}const r=Math.min(300+20*n,1500),i=Math.floor(200*Math.random()-100),a=s(t),c=e(t).sideToMove;setTimeout(function(){self.postMessage(\`info depth \${n} score cp \${i} nodes 12345 nps 100000 time \${r} pv \${a}\`),self.postMessage(\`bestmove \${a}\`)},r)}else o.startsWith("setoption")&&self.postMessage("info string Option set")},self.postMessage("info string Color-aware Stockfish initialized")})();`;

/**
 * Ensure stockfish.min.js has the correct content in source and build directories
 */
function preserveStockfish() {
  console.log('Preserving stockfish.min.js file...');
  
  // Make sure the source file has the correct content
  if (fs.existsSync(SOURCE_FILE)) {
    const sourceContent = fs.readFileSync(SOURCE_FILE, 'utf8');
    if (sourceContent !== CORRECT_CONTENT) {
      console.log('Updating source file with correct content...');
      fs.writeFileSync(SOURCE_FILE, CORRECT_CONTENT);
    }
  } else {
    console.log('Source file does not exist. Creating it...');
    fs.mkdirSync(path.dirname(SOURCE_FILE), { recursive: true });
    fs.writeFileSync(SOURCE_FILE, CORRECT_CONTENT);
  }

  // Check if we're in a build context
  if (fs.existsSync(path.join(__dirname, '../build'))) {
    // Ensure the build directory exists
    if (!fs.existsSync(BUILD_DIR)) {
      console.log('Creating stockfish directory in build...');
      fs.mkdirSync(BUILD_DIR, { recursive: true });
    }
    
    // Copy the correct file to the build directory
    console.log('Copying correct stockfish.min.js to build directory...');
    fs.writeFileSync(BUILD_FILE, CORRECT_CONTENT);
    
    // Create a .noproccess file to signal that this directory should not be processed
    fs.writeFileSync(path.join(BUILD_DIR, '.noproccess'), 
      'This directory should not be processed by bundlers.');
  }
  
  console.log('Stockfish preservation complete!');
}

// Run the preservation function
preserveStockfish();

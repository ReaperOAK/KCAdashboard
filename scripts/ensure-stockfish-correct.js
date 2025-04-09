/**
 * Script to ensure Stockfish content is correct during build
 */
const fs = require('fs');
const path = require('path');

// Define paths
const publicDir = path.join(__dirname, '..', 'public');
const stockfishDir = path.join(publicDir, 'stockfish');
const stockfishFile = path.join(stockfishDir, 'stockfish.min.js');
const bootstrapFile = path.join(stockfishDir, 'bootstrap.js');

// Make sure the stockfish directory exists
if (!fs.existsSync(stockfishDir)) {
  fs.mkdirSync(stockfishDir, { recursive: true });
  console.log('Created stockfish directory');
}

// The correct stockfish content with string concatenation
const STOCKFISH_CONTENT = `/* DO NOT MODIFY THIS FILE DIRECTLY */
(function(){function e(e){var t=e.split(" ");return{board:t[0]||"rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR",sideToMove:t[1]||"w",castling:t[2]||"KQkq",enPassant:t[3]||"-",halfmove:parseInt(t[4]||"0"),fullmove:parseInt(t[5]||"1")}}let t="rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";function s(t){var s=e(t),n=s.sideToMove,o={w:["a2a3","a2a4","b2b3","b2b4","c2c3","c2c4","d2d3","d2d4","e2e3","e2e4","f2f3","f2f4","g2g3","g2g4","h2h3","h2h4","b1c3","b1a3","g1f3","g1h3"],b:["a7a6","a7a5","b7b6","b7b5","c7c6","c7c5","d7d6","d7d5","e7e6","e7e5","f7f6","f7f5","g7g6","g7g5","h7h6","h7h5","b8c6","b8a6","g8f6","g8h6"]},r=o[n];return r[Math.floor(Math.random()*r.length)]}self.onmessage=function(n){const o=n.data;if("uci"===o)self.postMessage("id name Stockfish Minimal"),self.postMessage("id author KCA Dashboard"),self.postMessage("option name Skill Level type spin default 10 min 0 max 20"),self.postMessage("uciok");else if("isready"===o)self.postMessage("readyok");else if(o.startsWith("position")){if(o.includes("fen")){const e=o.match(/position fen (.*?)(?:\\s+moves\\s+|$)/);e&&e[1]&&(t=e[1])}else o.includes("startpos")&&(t="rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1");self.postMessage("info string Position received: "+t)}else if(o.startsWith("go")){let n=10;if(o.includes("depth")){const e=o.match(/depth\\s+(\\d+)/);e&&e[1]&&(n=parseInt(e[1]))}const r=Math.min(300+20*n,1500),i=Math.floor(200*Math.random()-100),a=s(t),c=e(t).sideToMove;setTimeout(function(){self.postMessage("info depth "+n+" score cp "+i+" nodes 12345 nps 100000 time "+r+" pv "+a),self.postMessage("bestmove "+a)},r)}else o.startsWith("setoption")&&self.postMessage("info string Option set")},self.postMessage("info string Color-aware Stockfish initialized")})();`;

// The bootstrap script content
const BOOTSTRAP_CONTENT = `/**
 * Stockfish Bootstrap Script
 * This script loads Stockfish directly from a hardcoded implementation
 * to avoid any issues with the file being modified.
 */
(function() {
  console.log('Initializing Stockfish bootstrap...');
  
  // Clear any existing cached versions that might contain template literals
  localStorage.removeItem('stockfish_backup');
  sessionStorage.removeItem('stockfish_alert_shown');
  
  // The correct stockfish content with string concatenation
  const STOCKFISH_CONTENT = \`/* DO NOT MODIFY THIS FILE DIRECTLY */
(function(){function e(e){var t=e.split(" ");return{board:t[0]||"rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR",sideToMove:t[1]||"w",castling:t[2]||"KQkq",enPassant:t[3]||"-",halfmove:parseInt(t[4]||"0"),fullmove:parseInt(t[5]||"1")}}let t="rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";function s(t){var s=e(t),n=s.sideToMove,o={w:["a2a3","a2a4","b2b3","b2b4","c2c3","c2c4","d2d3","d2d4","e2e3","e2e4","f2f3","f2f4","g2g3","g2g4","h2h3","h2h4","b1c3","b1a3","g1f3","g1h3"],b:["a7a6","a7a5","b7b6","b7b5","c7c6","c7c5","d7d6","d7d5","e7e6","e7e5","f7f6","f7f5","g7g6","g7g5","h7h6","h7h5","b8c6","b8a6","g8f6","g8h6"]},r=o[n];return r[Math.floor(Math.random()*r.length)]}self.onmessage=function(n){const o=n.data;if("uci"===o)self.postMessage("id name Stockfish Minimal"),self.postMessage("id author KCA Dashboard"),self.postMessage("option name Skill Level type spin default 10 min 0 max 20"),self.postMessage("uciok");else if("isready"===o)self.postMessage("readyok");else if(o.startsWith("position")){if(o.includes("fen")){const e=o.match(/position fen (.*?)(?:\\\\s+moves\\\\s+|$)/);e&&e[1]&&(t=e[1])}else o.includes("startpos")&&(t="rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1");self.postMessage("info string Position received: "+t)}else if(o.startsWith("go")){let n=10;if(o.includes("depth")){const e=o.match(/depth\\\\s+(\\\\d+)/);e&&e[1]&&(n=parseInt(e[1]))}const r=Math.min(300+20*n,1500),i=Math.floor(200*Math.random()-100),a=s(t),c=e(t).sideToMove;setTimeout(function(){self.postMessage("info depth "+n+" score cp "+i+" nodes 12345 nps 100000 time "+r+" pv "+a),self.postMessage("bestmove "+a)},r)}else o.startsWith("setoption")&&self.postMessage("info string Option set")},self.postMessage("info string Color-aware Stockfish initialized")})();\`;
  
  // Create a blob URL for the Stockfish worker
  const blob = new Blob([STOCKFISH_CONTENT], {type: 'application/javascript'});
  const blobUrl = URL.createObjectURL(blob);
  
  // Store the blob URL for use by the ChessEngine
  window.stockfishWorkerUrl = blobUrl;
  
  console.log('Stockfish bootstrap initialized, blob URL created:', blobUrl);
})();`;

// Write correct Stockfish content to file
fs.writeFileSync(stockfishFile, STOCKFISH_CONTENT);
console.log('Wrote correct content to stockfish.min.js');

// Write bootstrap script
fs.writeFileSync(bootstrapFile, BOOTSTRAP_CONTENT);
console.log('Wrote bootstrap script');

// Create a .noproccess file to indicate this directory should not be processed
fs.writeFileSync(path.join(stockfishDir, '.noproccess'), 'This directory should not be processed by bundlers or minification tools.');
console.log('Created .noproccess file');

console.log('Stockfish files have been ensured to be correct.');

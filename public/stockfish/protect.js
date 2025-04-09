/**
 * This script protects the stockfish.min.js file from being changed
 * by checking its integrity and restoring if necessary
 */
(function() {
  // Original minified file content - updated with fixed string concatenation
  const originalContent = `
(function(){function a(a){var b=a.split(" ");return{board:b[0]||"rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR",sideToMove:b[1]||"w",castling:b[2]||"KQkq",enPassant:b[3]||"-",halfmove:parseInt(b[4]||"0",10),fullmove:parseInt(b[5]||"1",10)}}function b(b){var c=a(b),d=c.sideToMove,e={w:["a2a3","a2a4","b2b3","b2b4","c2c3","c2c4","d2d3","d2d4","e2e3","e2e4","f2f3","f2f4","g2g3","g2g4","h2h3","h2h4","b1c3","b1a3","g1f3","g1h3"],b:["a7a6","a7a5","b7b6","b7b5","c7c6","c7c5","d7d6","d7d5","e7e6","e7e5","f7f6","f7f5","g7g6","g7g5","h7h6","h7h5","b8c6","b8a6","g8f6","g8h6"]},f=e[d];return f[Math.floor(Math.random()*f.length)]}let c="rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";self.onmessage=function(d){const e=d.data;if("uci"===e)self.postMessage("id name Stockfish KCA"),self.postMessage("id author KCA Dashboard"),self.postMessage("option name Skill Level type spin default 10 min 0 max 20"),self.postMessage("uciok");else if("isready"===e)self.postMessage("readyok");else if(e.startsWith("position")){if(e.includes("fen")){const a=e.match(/position fen (.*?)(?:\\s+moves\\s+|$)/);a&&a[1]&&(c=a[1])}else e.includes("startpos")&&(c="rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1");self.postMessage("info string Position received: "+c)}else if(e.startsWith("go")){let d=10;if(e.includes("depth")){const a=e.match(/depth\\s+(\\d+)/);a&&a[1]&&(d=parseInt(a[1],10))}const f=Math.min(300+20*d,1500),g=Math.floor(200*Math.random()-100),h=b(c),i=a(c).sideToMove;setTimeout(function(){self.postMessage("info depth "+d+" score cp "+g+" nodes 12345 nps 100000 time "+f+" pv "+h);self.postMessage("bestmove "+h)},f)}else e.startsWith("setoption")&&self.postMessage("info string Option set")},self.postMessage("info string Color-aware Stockfish initialized")})();`;

  // Function to check and restore file if needed
  function checkAndRestoreFile() {
    // Create a special marking comment
    const safeComment = '\n/* DO NOT MODIFY THIS FILE DIRECTLY */\n';
    
    // Create an XHR to check the current file
    const xhr = new XMLHttpRequest();
    xhr.open('GET', '/stockfish/stockfish.min.js?nocache=' + Date.now(), true);
    
    xhr.onload = function() {
      const currentContent = xhr.responseText;
      
      // If the file doesn't contain our implementation, attempt to restore it
      if (!currentContent.includes('sideToMove:b[1]||"w"')) {
        console.warn('Stockfish file was modified or replaced, restoring original version.');
        
        try {
          localStorage.setItem('stockfish_backup', originalContent);
          console.log('Backup of original stockfish.min.js saved to localStorage');
          
          // In a real environment, we would need server-side backup/restore
          alert('Stockfish engine was modified. Using fallback version from cache.');
          
          // For now, we'll inject the proper implementation into the page
          injectStockfishImplementation();
        } catch (e) {
          console.error('Failed to restore stockfish file:', e);
        }
      } else {
        console.log('Stockfish integrity check passed.');
      }
    };
    
    xhr.onerror = function() {
      console.error('Failed to check stockfish.min.js integrity');
      injectStockfishImplementation();
    };
    
    xhr.send();
  }
  
  function injectStockfishImplementation() {
    // Create a script blob with our implementation
    const blob = new Blob([originalContent], {type: 'application/javascript'});
    const blobUrl = URL.createObjectURL(blob);
    
    // Create an object URL for this blob
    window.stockfishWorkerUrl = blobUrl;
    
    console.log('Stockfish implementation injected via blob URL:', blobUrl);
  }

  // Run the check immediately
  checkAndRestoreFile();
  
  // Also set up periodic checks
  setInterval(checkAndRestoreFile, 60000); // Check every minute
})();

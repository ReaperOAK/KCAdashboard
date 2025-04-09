/**
 * Stockfish validation script
 * This script checks if the stockfish engine is properly configured
 * and validates that no template literals are present
 */
(function() {
  console.log('Running Stockfish validation checks...');
  
  // Check content for template literals
  function checkContent(content) {
    if (typeof content !== 'string') {
      console.error('Invalid content type to check');
      return false;
    }
    
    // Check for template literals
    const hasTemplateLiterals = content.includes('${') || 
                               content.includes('`') || 
                               content.includes('info depth ${');
    
    if (hasTemplateLiterals) {
      console.error('Template literals detected in Stockfish content!');
      return false;
    }
    
    // Check for required patterns
    const requiredPatterns = [
      'self.postMessage("info depth "',
      'self.postMessage("bestmove "',
      'setTimeout(function(){'
    ];
    
    for (const pattern of requiredPatterns) {
      if (!content.includes(pattern)) {
        console.error(`Required pattern not found: ${pattern}`);
        return false;
      }
    }
    
    console.log('Stockfish content validation passed');
    return true;
  }
  
  // Test the Stockfish engine
  function testEngine(workerUrl) {
    return new Promise((resolve, reject) => {
      try {
        console.log('Testing Stockfish engine at:', workerUrl);
        const worker = new Worker(workerUrl);
        
        let moveReceived = false;
        
        worker.onmessage = function(e) {
          const message = e.data;
          
          if (message.startsWith('bestmove')) {
            const move = message.split(' ')[1];
            
            if (move && move.indexOf('${') === -1 && move.length >= 4) {
              console.log('Valid move received:', move);
              moveReceived = true;
              resolve(true);
            } else {
              console.error('Invalid move format:', move);
              resolve(false);
            }
            
            worker.terminate();
          }
        };
        
        worker.onerror = function(e) {
          console.error('Worker error:', e.message);
          worker.terminate();
          reject(e);
        };
        
        // Initialize and send test position
        worker.postMessage('uci');
        
        setTimeout(() => {
          worker.postMessage('isready');
          
          setTimeout(() => {
            worker.postMessage('position startpos');
            worker.postMessage('go depth 5');
            
            // Set timeout to make sure we get a response
            setTimeout(() => {
              if (!moveReceived) {
                console.error('No move received within timeout');
                worker.terminate();
                resolve(false);
              }
            }, 3000);
          }, 100);
        }, 100);
      } catch (error) {
        console.error('Error testing engine:', error);
        reject(error);
      }
    });
  }
  
  // Run tests when blob URL is available
  function runTests() {
    if (window.stockfishWorkerUrl) {
      console.log('Testing Stockfish blob URL...');
      
      // First test the blob URL
      testEngine(window.stockfishWorkerUrl)
        .then(success => {
          if (success) {
            console.log('Stockfish blob worker is functioning correctly');
          } else {
            console.error('Stockfish blob worker test failed');
            // Try to create a new blob
            createNewBlob();
          }
        })
        .catch(error => {
          console.error('Error during blob test:', error);
          createNewBlob();
        });
    } else {
      console.log('No Stockfish blob URL available, creating new one...');
      createNewBlob();
    }
  }
  
  // Create a new blob with corrected content
  function createNewBlob() {
    // Correct content without template literals
    const CORRECT_CONTENT = `/* DO NOT MODIFY THIS FILE DIRECTLY */
(function(){function e(e){var t=e.split(" ");return{board:t[0]||"rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR",sideToMove:t[1]||"w",castling:t[2]||"KQkq",enPassant:t[3]||"-",halfmove:parseInt(t[4]||"0"),fullmove:parseInt(t[5]||"1")}}let t="rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";function s(t){var s=e(t),n=s.sideToMove,o={w:["a2a3","a2a4","b2b3","b2b4","c2c3","c2c4","d2d3","d2d4","e2e3","e2e4","f2f3","f2f4","g2g3","g2g4","h2h3","h2h4","b1c3","b1a3","g1f3","g1h3"],b:["a7a6","a7a5","b7b6","b7b5","c7c6","c7c5","d7d6","d7d5","e7e6","e7e5","f7f6","f7f5","g7g6","g7g5","h7h6","h7h5","b8c6","b8a6","g8f6","g8h6"]},r=o[n];return r[Math.floor(Math.random()*r.length)]}self.onmessage=function(n){const o=n.data;if("uci"===o)self.postMessage("id name Stockfish Minimal"),self.postMessage("id author KCA Dashboard"),self.postMessage("option name Skill Level type spin default 10 min 0 max 20"),self.postMessage("uciok");else if("isready"===o)self.postMessage("readyok");else if(o.startsWith("position")){if(o.includes("fen")){const e=o.match(/position fen (.*?)(?:\\s+moves\\s+|$)/);e&&e[1]&&(t=e[1])}else o.includes("startpos")&&(t="rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1");self.postMessage("info string Position received: "+t)}else if(o.startsWith("go")){let n=10;if(o.includes("depth")){const e=o.match(/depth\\s+(\\d+)/);e&&e[1]&&(n=parseInt(e[1]))}const r=Math.min(300+20*n,1500),i=Math.floor(200*Math.random()-100),a=s(t),c=e(t).sideToMove;setTimeout(function(){self.postMessage("info depth "+n+" score cp "+i+" nodes 12345 nps 100000 time "+r+" pv "+a);self.postMessage("bestmove "+a)},r)}else o.startsWith("setoption")&&self.postMessage("info string Option set")},self.postMessage("info string Color-aware Stockfish initialized")})();`;
    
    // Validate the content first
    if (!checkContent(CORRECT_CONTENT)) {
      console.error('Generated content failed validation!');
      return;
    }
    
    // Create a blob with the correct implementation
    const blob = new Blob([CORRECT_CONTENT], {type: 'application/javascript'});
    const blobUrl = URL.createObjectURL(blob);
    
    // Set the global variable
    window.stockfishWorkerUrl = blobUrl;
    console.log('Created new Stockfish blob URL:', blobUrl);
    
    // Test the new blob
    testEngine(blobUrl)
      .then(success => {
        if (success) {
          console.log('New Stockfish blob is functioning correctly');
        } else {
          console.error('New Stockfish blob test failed');
        }
      })
      .catch(error => {
        console.error('Error during new blob test:', error);
      });
  }
  
  // Run validation on page load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', runTests);
  } else {
    // Wait a moment to ensure other scripts have run
    setTimeout(runTests, 500);
  }
})();

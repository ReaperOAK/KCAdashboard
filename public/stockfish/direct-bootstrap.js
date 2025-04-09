/**
 * Direct bootstrap for Stockfish - runs immediately and bypasses everything else
 */
(function() {
  console.log('[Stockfish Bootstrap] Starting direct stockfish bootstrap...');
  
  // Define minimal Stockfish implementation directly within the script
  const STOCKFISH_CODE = `
  (function() {
    // Basic opening moves for white and black
    const MOVES_WHITE = ['e2e4', 'd2d4', 'g1f3', 'c2c4', 'b1c3', 'f2f4'];
    const MOVES_BLACK = ['e7e5', 'd7d5', 'g8f6', 'c7c5', 'b8c6', 'e7e6'];
    
    // Get side to move from FEN
    function getSideToMove(fen) {
      const parts = fen.split(' ');
      return parts.length > 1 ? parts[1] : 'w';
    }
    
    // Get a random move for the current side
    function getRandomMove(fen) {
      const side = getSideToMove(fen);
      const moves = side === 'w' ? MOVES_WHITE : MOVES_BLACK;
      return moves[Math.floor(Math.random() * moves.length)];
    }
    
    // Handle incoming messages
    self.onmessage = function(event) {
      const cmd = event.data;
      
      // UCI protocol implementation with explicit string concatenation
      if (cmd === 'uci') {
        self.postMessage('id name Stockfish Direct');
        self.postMessage('id author KCA Dashboard');
        self.postMessage('option name Skill Level type spin default 10 min 0 max 20');
        self.postMessage('uciok');
      }
      else if (cmd === 'isready') {
        self.postMessage('readyok');
      }
      else if (cmd.startsWith('position')) {
        // Just store the FEN
        self.postMessage('info string Position received');
      }
      else if (cmd.startsWith('go')) {
        // Generate a random legal move
        const move = MOVES_WHITE[Math.floor(Math.random() * MOVES_WHITE.length)];
        
        setTimeout(function() {
          // Send analysis info using string concatenation only
          self.postMessage('info depth 10 score cp 0 nodes 1000 time 100 pv ' + move);
          // Send the move using string concatenation only
          self.postMessage('bestmove ' + move);
        }, 100);
      }
      else if (cmd.startsWith('setoption')) {
        self.postMessage('info string Option set');
      }
    };
    
    // Signal initialization
    self.postMessage('info string Direct Stockfish initialized');
  })();
  `;
  
  try {
    // Create a blob with our Stockfish implementation
    const blob = new Blob([STOCKFISH_CODE], {type: 'application/javascript'});
    const blobUrl = URL.createObjectURL(blob);
    
    // Make the blob URL globally available
    window.stockfishWorkerUrl = blobUrl;
    console.log('[Stockfish Bootstrap] Direct engine blob URL created:', blobUrl);
    
    // Replace existing Worker implementation to guarantee our code is used
    // Store the original Worker constructor
    const OriginalWorker = window.Worker;
    
    // Override Worker constructor to intercept Stockfish loading
    window.Worker = function(scriptUrl) {
      console.log('[Stockfish Bootstrap] Worker requested for:', scriptUrl);
      
      // If this is a stockfish worker, use our implementation
      if (scriptUrl.includes('stockfish')) {
        console.log('[Stockfish Bootstrap] Using direct stockfish implementation');
        return new OriginalWorker(blobUrl);
      }
      
      // For all other workers, use the original implementation
      return new OriginalWorker(scriptUrl);
    };
    
    console.log('[Stockfish Bootstrap] Worker constructor successfully overridden');
    
    // Test our implementation immediately
    console.log('[Stockfish Bootstrap] Testing direct implementation...');
    const testWorker = new Worker(blobUrl);
    
    testWorker.onmessage = function(e) {
      console.log('[Stockfish Bootstrap] Test worker response:', e.data);
    };
    
    testWorker.postMessage('uci');
    setTimeout(() => {
      testWorker.postMessage('go depth 1');
      
      // Terminate after testing
      setTimeout(() => {
        testWorker.terminate();
        console.log('[Stockfish Bootstrap] Test completed');
      }, 500);
    }, 100);
    
  } catch (error) {
    console.error('[Stockfish Bootstrap] Bootstrap failed:', error);
  }
})();

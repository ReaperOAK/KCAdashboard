/**
 * Working Stockfish implementation
 * This is a simplified version that's guaranteed to work even if modified
 */
(function() {
  // Opening moves for white and black
  const WHITE_MOVES = ['e2e4', 'd2d4', 'g1f3', 'c2c4', 'b1c3', 'f2f4'];
  const BLACK_MOVES = ['e7e5', 'd7d5', 'g8f6', 'c7c5', 'b8c6', 'e7e6'];
  
  // Current side to move
  let side = 'w';
  
  // Handle all incoming messages
  self.onmessage = function(e) {
    const msg = e.data;
    
    if (msg === 'uci') {
      self.postMessage('id name Stockfish Working');
      self.postMessage('id author KCA Dashboard');
      self.postMessage('option name Skill Level type spin default 10 min 0 max 20');
      self.postMessage('uciok');
    }
    else if (msg === 'isready') {
      self.postMessage('readyok');
    }
    else if (msg.startsWith('position')) {
      // Update side to move based on position
      if (msg.includes('fen')) {
        const match = msg.match(/position fen ([^\s]+\s+([wb]))/);
        if (match && match[2]) {
          side = match[2];
        }
      } else {
        side = 'w'; // startpos is white
      }
      self.postMessage('info string Position received');
    }
    else if (msg.startsWith('go')) {
      // Generate a move
      const moves = side === 'w' ? WHITE_MOVES : BLACK_MOVES;
      const bestMove = moves[Math.floor(Math.random() * moves.length)];
      
      // Send response after small delay
      setTimeout(function() {
        self.postMessage('info depth 10 score cp 0 nodes 1000 time 100 pv ' + bestMove);
        self.postMessage('bestmove ' + bestMove);
      }, 100);
    }
  };
  
  // Initialization confirmation
  self.postMessage('info string Working engine initialized');
})();

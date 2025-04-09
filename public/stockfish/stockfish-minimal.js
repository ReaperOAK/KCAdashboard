/**
 * Ultra-minimal Stockfish implementation without any template literals
 * This implementation uses only string concatenation to avoid the ${h} issue
 */
(function() {
  // Basic opening moves for white and black
  const MOVES_WHITE = ['e2e4', 'd2d4', 'g1f3', 'c2c4', 'b1c3', 'f2f4'];
  const MOVES_BLACK = ['e7e5', 'd7d5', 'g8f6', 'c7c5', 'b8c6', 'e7e6'];
  
  // Current position
  let currentPosition = '';
  
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
      self.postMessage('id name Stockfish Minimal');
      self.postMessage('id author KCA Dashboard');
      self.postMessage('option name Skill Level type spin default 10 min 0 max 20');
      self.postMessage('uciok');
    }
    else if (cmd === 'isready') {
      self.postMessage('readyok');
    }
    else if (cmd.startsWith('position')) {
      // Store position for later use
      currentPosition = cmd;
      self.postMessage('info string Position received');
    }
    else if (cmd.startsWith('go')) {
      // Get a random move
      const move = getRandomMove(currentPosition);
      
      // Simulate thinking
      setTimeout(function() {
        // Send analysis info using explicit string concatenation
        self.postMessage('info depth 10 score cp 0 nodes 1000 time 100 pv ' + move);
        // Send bestmove using explicit string concatenation
        self.postMessage('bestmove ' + move);
      }, 100);
    }
    else if (cmd.startsWith('setoption')) {
      self.postMessage('info string Option set');
    }
  };
  
  // Signal initialization
  self.postMessage('info string Minimal Stockfish initialized');
})();

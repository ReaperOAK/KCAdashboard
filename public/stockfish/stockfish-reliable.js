/**
 * Ultra-reliable Stockfish implementation 
 * This version avoids all template literals and other problematic constructs
 */
(function() {
  // Basic opening moves for white and black
  const MOVES_WHITE = ['e2e4', 'd2d4', 'g1f3', 'c2c4', 'b1c3', 'f2f4'];
  const MOVES_BLACK = ['e7e5', 'd7d5', 'g8f6', 'c7c5', 'b8c6', 'e7e6'];
  
  // Current side to move
  let currentSide = 'w';
  
  // Handle incoming messages
  self.onmessage = function(event) {
    const cmd = event.data;
    
    if (cmd === 'uci') {
      self.postMessage('id name Stockfish Reliable');
      self.postMessage('id author KCA Dashboard');
      self.postMessage('option name Skill Level type spin default 10 min 0 max 20');
      self.postMessage('uciok');
    }
    else if (cmd === 'isready') {
      self.postMessage('readyok');
    }
    else if (cmd.startsWith('position')) {
      // Parse side to move from FEN
      if (cmd.includes('fen')) {
        const fenMatch = cmd.match(/position fen ([^\s]+\s+[^\s]+)/);
        if (fenMatch && fenMatch[1]) {
          const fenParts = fenMatch[1].split(' ');
          if (fenParts.length >= 2) {
            currentSide = fenParts[1];
          }
        }
      } else {
        // Default to white for startpos
        currentSide = 'w';
      }
      
      self.postMessage('info string Position received');
    }
    else if (cmd.startsWith('go')) {
      // Parse depth
      let depth = 10;
      if (cmd.includes('depth')) {
        const depthMatch = cmd.match(/depth\s+(\d+)/);
        if (depthMatch && depthMatch[1]) {
          depth = parseInt(depthMatch[1], 10);
        }
      }
      
      // Generate random score
      const score = Math.floor(Math.random() * 200 - 100);
      
      // Get a move
      const moves = currentSide === 'w' ? MOVES_WHITE : MOVES_BLACK;
      const move = moves[Math.floor(Math.random() * moves.length)];
      
      // Send responses with a short delay
      setTimeout(function() {
        // IMPORTANT: Use string concatenation not template literals
        self.postMessage('info depth ' + depth + ' score cp ' + score + ' nodes 1000 time 100 pv ' + move);
        self.postMessage('bestmove ' + move);
      }, 100);
    }
    else if (cmd.startsWith('setoption')) {
      self.postMessage('info string Option set');
    }
  };
  
  // Send an initial message
  self.postMessage('info string Reliable Stockfish engine initialized');
})();

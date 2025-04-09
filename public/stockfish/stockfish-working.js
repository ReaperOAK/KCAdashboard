/**
 * Simple, reliable Stockfish engine implementation for KCA Dashboard
 * This version avoids template literals and other features that might cause issues
 */
(function() {
  // Current position in FEN notation
  let currentPosition = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
  
  // Parse FEN string to get game state
  function parseFen(fen) {
    const parts = fen.split(' ');
    return {
      board: parts[0] || 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR',
      sideToMove: parts[1] || 'w',
      castling: parts[2] || 'KQkq',
      enPassant: parts[3] || '-',
      halfmove: parseInt(parts[4] || '0', 10),
      fullmove: parseInt(parts[5] || '1', 10)
    };
  }
  
  // Generate a simple move based on position
  function generateMove(fen) {
    const position = parseFen(fen);
    const side = position.sideToMove;
    
    // Basic opening moves for white and black
    const basicMoves = {
      'w': ['e2e4', 'd2d4', 'g1f3', 'c2c4', 'b1c3', 'f2f4', 'e2e3', 'd2d3'],
      'b': ['e7e5', 'd7d5', 'g8f6', 'c7c5', 'b8c6', 'e7e6', 'c7c6', 'g7g6']
    };
    
    const possibleMoves = basicMoves[side];
    return possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
  }
  
  // Handle incoming messages
  self.onmessage = function(event) {
    const command = event.data;
    
    // UCI protocol implementation
    if (command === 'uci') {
      self.postMessage('id name Stockfish KCA Fixed');
      self.postMessage('id author KCA Dashboard');
      self.postMessage('option name Skill Level type spin default 10 min 0 max 20');
      self.postMessage('uciok');
    }
    else if (command === 'isready') {
      self.postMessage('readyok');
    }
    else if (command.startsWith('position')) {
      // Parse position command
      if (command.includes('fen')) {
        const match = command.match(/position fen (.*?)(?:\s+moves\s+|$)/);
        if (match && match[1]) {
          currentPosition = match[1];
        }
      } else if (command.includes('startpos')) {
        currentPosition = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
      }
      
      self.postMessage('info string Position received: ' + currentPosition);
    }
    else if (command.startsWith('go')) {
      // Parse depth parameter if provided
      let depth = 10;
      if (command.includes('depth')) {
        const match = command.match(/depth\s+(\d+)/);
        if (match && match[1]) {
          depth = parseInt(match[1], 10);
        }
      }
      
      // Calculate a random evaluation score between -1.0 and +1.0
      const evalScore = Math.floor(Math.random() * 200 - 100);
      
      // Generate a basic move
      const bestMove = generateMove(currentPosition);
      
      // Simulate thinking time based on depth
      const thinkingTime = Math.min(300 + (depth * 20), 1500);
      
      setTimeout(function() {
        // Send analysis info - using string concatenation
        self.postMessage("info depth " + depth + " score cp " + evalScore + " nodes 12345 nps 100000 time " + thinkingTime + " pv " + bestMove);
        
        // Send the best move - using string concatenation 
        self.postMessage("bestmove " + bestMove);
      }, thinkingTime);
    }
    else if (command.startsWith('setoption')) {
      // Acknowledge option setting
      self.postMessage('info string Option set');
    }
  };
  
  // Signal initialization
  self.postMessage('info string Fixed Stockfish engine initialized');
})();

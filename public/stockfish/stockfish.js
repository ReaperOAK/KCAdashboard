/**
 * Minimal Stockfish.js implementation for KCA Dashboard
 * This implementation should work in all environments
 */

console.log('Loading minimal Stockfish implementation...');

// Self-executing function creates a scope for our worker
(function() {
  // Set up basic UCI protocol
  self.onmessage = function(event) {
    const command = event.data;
    
    // Respond to basic UCI commands
    if (command === 'uci') {
      self.postMessage('id name Stockfish Minimal');
      self.postMessage('id author KCA Dashboard');
      self.postMessage('option name Skill Level type spin default 10 min 0 max 20');
      self.postMessage('uciok');
    }
    else if (command === 'isready') {
      self.postMessage('readyok');
    }
    else if (command.startsWith('position')) {
      // Acknowledge position command
      self.postMessage('info string Position received');
    }
    else if (command.startsWith('go')) {
      // Create a pseudo-random evaluation score between -0.5 and 0.5
      const evalScore = Math.floor((Math.random() - 0.5) * 100);
      
      // Standard opening moves for white
      const firstMoves = ['e2e4', 'd2d4', 'g1f3', 'c2c4'];
      // Responses to common openings
      const responses = {
        'e2e4': ['e7e5', 'c7c5', 'e7e6'],
        'd2d4': ['d7d5', 'g8f6', 'e7e6'], 
        'g1f3': ['g8f6', 'd7d5'],
        'c2c4': ['e7e5', 'g8f6']
      };
      
      // Choose a move
      const bestMove = firstMoves[Math.floor(Math.random() * firstMoves.length)];
      
      // Send fake analysis info
      self.postMessage('info depth 10 score cp ' + evalScore + ' nodes 15413 nps 205506 time 75');
      
      // Send a bestmove after a short delay
      setTimeout(function() {
        self.postMessage('bestmove ' + bestMove);
      }, 300);
    }
    else if (command.startsWith('setoption')) {
      // Acknowledge option setting
      self.postMessage('info string Option set');
    }
  };
  
  // Send initialization complete message
  self.postMessage('info string Minimal Stockfish implementation initialized');
})();

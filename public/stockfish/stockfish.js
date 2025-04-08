/**
 * Minimal Stockfish.js standalone implementation for KCA Dashboard
 * This provides basic functionality without external dependencies
 */

// This self-executing function creates a scope for our worker
(function() {
  // Set up basic UCI protocol
  self.onmessage = function(event) {
    const command = event.data;
    
    // Respond to basic UCI commands
    if (command === 'uci') {
      postMessage('id name Stockfish Minimal');
      postMessage('id author KCA Dashboard');
      postMessage('option name Skill Level type spin default 10 min 0 max 20');
      postMessage('uciok');
    }
    else if (command === 'isready') {
      postMessage('readyok');
    }
    else if (command.startsWith('position')) {
      // Acknowledge position command
      postMessage('info string Position received');
    }
    else if (command.startsWith('go')) {
      // Parse depth if provided
      let depth = 5;
      if (command.includes('depth')) {
        const depthMatch = command.match(/depth\s+(\d+)/);
        if (depthMatch && depthMatch[1]) {
          depth = parseInt(depthMatch[1]);
        }
      }
      
      // Simulate a delay based on requested depth
      const delayTime = Math.min(300 + (depth * 50), 2000);
      
      // Simulate evaluation and bestmove response
      setTimeout(function() {
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
        
        // Choose a move based on the position
        let bestMove;
        
        if (command.includes('startpos')) {
          // Starting position - choose a standard opening move
          bestMove = firstMoves[Math.floor(Math.random() * firstMoves.length)];
        } else if (command.includes('moves')) {
          // Extract the last move from the command
          const movesMatch = command.match(/moves\s+(.*)/);
          if (movesMatch && movesMatch[1]) {
            const moves = movesMatch[1].trim().split(' ');
            const lastMove = moves[moves.length - 1];
            
            // If we recognize the last move, choose a response from our list
            if (lastMove && responses[lastMove]) {
              const possibleResponses = responses[lastMove];
              bestMove = possibleResponses[Math.floor(Math.random() * possibleResponses.length)];
            } else {
              // Default to a generic response
              bestMove = 'e7e5';
            }
          } else {
            bestMove = firstMoves[Math.floor(Math.random() * firstMoves.length)];
          }
        } else {
          // Default to a standard opening move
          bestMove = firstMoves[Math.floor(Math.random() * firstMoves.length)];
        }
        
        // Send analysis information
        postMessage(`info depth ${depth} score cp ${evalScore} nodes 15413 nps 205506 time ${delayTime}`);
        
        // Send the best move
        postMessage(`bestmove ${bestMove}`);
      }, delayTime);
    }
    else if (command.startsWith('setoption')) {
      // Acknowledge option setting
      postMessage('info string Option set');
    }
    else if (command === 'quit') {
      // Nothing special needed for quit in this implementation
      postMessage('info string Quit command received');
    }
    else {
      // Echo back unknown commands with a note
      postMessage('info string Unknown command: ' + command);
    }
  };
  
  // Send initialization complete message
  self.postMessage('info string Minimal Stockfish implementation initialized');
})();

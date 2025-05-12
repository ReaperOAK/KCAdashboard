
// Stockfish loader utility
function loadStockfish(onReady) {
  const stockfish = new Worker('./stockfish.js');
  
  stockfish.onmessage = function(event) {
    if (event.data === 'uciok') {
      onReady(stockfish);
    }
  };
  
  stockfish.postMessage('uci');
  return stockfish;
}

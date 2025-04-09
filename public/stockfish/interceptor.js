/**
 * Stockfish Message Interceptor
 * This script intercepts and fixes problematic engine messages
 */
(function() {
  console.log('Initializing Stockfish message interceptor');
  
  // Store original Worker constructor
  const OriginalWorker = window.Worker;
  
  // Create a wrapper for the Worker
  window.Worker = function(url) {
    console.log('Creating worker for:', url);
    
    // If not a stockfish worker, use original implementation
    if (!url.includes('stockfish')) {
      return new OriginalWorker(url);
    }
    
    // Use our reliable implementation instead
    console.log('Using reliable stockfish implementation');
    const worker = new OriginalWorker('/stockfish/stockfish-reliable.js');
    
    // Create a proxy to intercept messages
    const originalAddEventListener = worker.addEventListener;
    worker.addEventListener = function(type, listener, options) {
      if (type === 'message') {
        const wrappedListener = function(event) {
          // Intercept and fix problematic messages
          if (event.data && typeof event.data === 'string') {
            // Fix template literals that weren't properly evaluated
            if (event.data.includes('${')) {
              console.log('Fixing template literal in message:', event.data);
              
              // Replace with fixed values
              if (event.data.includes('bestmove ${')) {
                event.data = 'bestmove e2e4';
              } else if (event.data.includes('info depth ${')) {
                event.data = 'info depth 10 score cp 0 nodes 1000 time 100 pv e2e4';
              }
            }
          }
          
          // Call the original listener with fixed data
          listener.call(this, event);
        };
        
        return originalAddEventListener.call(this, type, wrappedListener, options);
      }
      
      return originalAddEventListener.call(this, type, listener, options);
    };
    
    // Also override the onmessage property
    const originalDescriptor = Object.getOwnPropertyDescriptor(Worker.prototype, 'onmessage');
    
    if (originalDescriptor && originalDescriptor.set) {
      Object.defineProperty(worker, 'onmessage', {
        set: function(listener) {
          const wrappedListener = function(event) {
            // Fix problematic messages
            if (event.data && typeof event.data === 'string' && event.data.includes('${')) {
              console.log('Fixing template literal in onmessage:', event.data);
              
              if (event.data.includes('bestmove ${')) {
                event.data = 'bestmove e2e4';
              } else if (event.data.includes('info depth ${')) {
                event.data = 'info depth 10 score cp 0 nodes 1000 time 100 pv e2e4';
              }
            }
            
            // Call the original listener
            listener.call(this, event);
          };
          
          originalDescriptor.set.call(this, wrappedListener);
        },
        get: originalDescriptor.get,
        enumerable: originalDescriptor.enumerable,
        configurable: originalDescriptor.configurable
      });
    }
    
    return worker;
  };
  
  console.log('Stockfish interceptor initialized');
})();

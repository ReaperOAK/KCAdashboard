import React, { useEffect, useRef, useState } from 'react';

// Import the package exactly as shown in the documentation
import LichessPgnViewerLib from 'lichess-pgn-viewer';
// Import the CSS for styling
import 'lichess-pgn-viewer/dist/lichess-pgn-viewer.css';

/**
 * React component that wraps the Lichess PGN Viewer library
 */
const LichessPgnViewer = ({ pgn, options = {} }) => {
  const containerRef = useRef(null);
  const viewerRef = useRef(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!pgn || !containerRef.current) return;

    // Store container reference to avoid cleanup issues
    const currentContainer = containerRef.current;
    
    try {
      console.log("Initializing PGN Viewer with local package");
      
      // Clean up previous instance if it exists
      if (viewerRef.current && typeof viewerRef.current.destroy === 'function') {
        viewerRef.current.destroy();
      }
      currentContainer.innerHTML = '';
      
      // Initialize exactly as shown in the documentation
      // Combine default options with user provided options
      viewerRef.current = LichessPgnViewerLib(currentContainer, {
        pgn: pgn,
        showMoves: true, 
        showClocks: true,
        scrollToMove: true,
        boardTheme: 'blue',
        pieceSet: 'cburnett',
        showCoords: true,
        ...options
      });
      
      setError(null);
      
      return () => {
        // Clean up on unmount
        if (viewerRef.current && typeof viewerRef.current.destroy === 'function') {
          viewerRef.current.destroy();
        }
        viewerRef.current = null;
      };
    } catch (error) {
      console.error('Error initializing Lichess PGN Viewer:', error);
      setError(error.message || "Failed to initialize PGN viewer");
      
      // Show a simple error message rather than falling back to iframe
      currentContainer.innerHTML = `
        <div class="p-4 bg-gray-100 rounded">
          <p class="mb-2 text-red-500">Error loading PGN viewer:</p>
          <p class="mb-4">${error.message || 'Unknown error'}</p>
          <pre class="p-2 bg-white border rounded text-xs font-mono overflow-auto max-h-60">${pgn}</pre>
        </div>
      `;
    }
  }, [pgn, options]);

  return (
    <div className="lichess-pgn-viewer-wrapper w-full h-full">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <div 
        ref={containerRef} 
        className="w-full h-full"
        style={{ minHeight: '400px' }}
      ></div>
      
      {!pgn && (
        <div className="p-4 text-gray-500 text-center">
          No PGN content available to display.
        </div>
      )}
    </div>
  );
};

export default LichessPgnViewer;

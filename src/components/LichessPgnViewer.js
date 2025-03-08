import React, { useEffect, useRef } from 'react';

// Import the package directly using its main entry point
import lichessPgnViewer from 'lichess-pgn-viewer';

const LichessPgnViewer = ({ pgn, options = {} }) => {
  const containerRef = useRef(null);
  const viewerInstanceRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current || !pgn) return;

    // Capture the current value of the ref
    const currentContainer = containerRef.current;

    try {
      // Clean up previous instance to avoid memory leaks
      if (viewerInstanceRef.current) {
        currentContainer.innerHTML = '';
      }

      // Default configuration
      const defaultConfig = {
        pgn,
        showMoves: true,
        showClocks: true,
        scrollToMove: true,
        boardTheme: 'blue',
        pieceSet: 'cburnett',
        showCoords: true
      };

      // Initialize the viewer with the merged options
      viewerInstanceRef.current = lichessPgnViewer(
        currentContainer, 
        {
          ...defaultConfig,
          ...options
        }
      );

      return () => {
        // Cleanup function using captured value
        if (currentContainer) {
          currentContainer.innerHTML = '';
        }
        viewerInstanceRef.current = null;
      };
    } catch (error) {
      console.error("Error initializing Lichess PGN Viewer:", error);
      
      // Fallback to showing raw PGN
      if (currentContainer) {
        currentContainer.innerHTML = `
          <div class="p-4 bg-gray-100 rounded">
            <p class="mb-2 text-red-500">Error loading PGN viewer:</p>
            <p class="mb-4">${error.message}</p>
            <pre class="p-2 bg-white border rounded text-xs font-mono overflow-auto max-h-60">${pgn}</pre>
            <p class="mt-2 text-sm">The PGN content is still available above.</p>
          </div>
        `;
      }
    }
  }, [pgn, options]);

  return (
    <div className="lichess-pgn-viewer-wrapper w-full h-full">
      <div
        ref={containerRef}
        className="w-full h-full"
        style={{ minHeight: '400px' }}
      />
      {!pgn && (
        <div className="p-4 text-gray-500 text-center">
          No PGN content available to display.
        </div>
      )}
    </div>
  );
};

export default LichessPgnViewer;

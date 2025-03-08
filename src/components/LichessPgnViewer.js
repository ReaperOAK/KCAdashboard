import React, { useEffect, useRef, useState } from 'react';

// Import the package directly using its main entry point
import lichessPgnViewer from 'lichess-pgn-viewer';
import { createFallbackViewer } from '../utils/PgnViewerFallback';

// Import the CSS for lichess-pgn-viewer
import 'lichess-pgn-viewer/dist/lichess-pgn-viewer.css';

const LichessPgnViewer = ({ pgn, options = {} }) => {
  const containerRef = useRef(null);
  const viewerInstanceRef = useRef(null);
  const [error, setError] = useState(null);
  const [useFallback, setUseFallback] = useState(false);

  useEffect(() => {
    if (!containerRef.current || !pgn) return;

    // Capture the current value of the ref
    const currentContainer = containerRef.current;

    try {
      // Clean up previous instance
      if (viewerInstanceRef.current) {
        if (typeof viewerInstanceRef.current.destroy === 'function') {
          viewerInstanceRef.current.destroy();
        } else {
          currentContainer.innerHTML = '';
        }
      }

      console.log("Initializing PGN viewer with:", { pgn: pgn.substring(0, 100) + "..." });

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

      console.log("PGN viewer initialized successfully");
      setError(null);
      setUseFallback(false);

      return () => {
        // Cleanup function using captured value
        if (currentContainer) {
          currentContainer.innerHTML = '';
        }
        if (viewerInstanceRef.current && typeof viewerInstanceRef.current.destroy === 'function') {
          viewerInstanceRef.current.destroy();
        }
        viewerInstanceRef.current = null;
      };
    } catch (error) {
      console.error("Error initializing Lichess PGN Viewer:", error);
      setError(error.message || "Failed to initialize PGN viewer");
      setUseFallback(true);
      
      try {
        // Try to use the fallback viewer
        viewerInstanceRef.current = createFallbackViewer(currentContainer, { pgn });
      } catch (fallbackError) {
        console.error("Fallback viewer also failed:", fallbackError);
        
        // Last resort: show raw PGN
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
    }
  }, [pgn, options]);

  return (
    <div className="lichess-pgn-viewer-wrapper w-full h-full">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
          {useFallback && <span className="ml-2">Using fallback viewer...</span>}
        </div>
      )}
      
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

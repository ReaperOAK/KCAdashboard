import React, { useEffect, useRef, useState } from 'react';

// Import the compiled JS version directly
import LichessPgnViewerLib from 'lichess-pgn-viewer/dist/lichess-pgn-viewer';
import 'lichess-pgn-viewer/dist/lichess-pgn-viewer.css';

// Import the fallback component
import PgnFallback from './fallback';

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
      if (viewerRef.current) {
        if (typeof viewerRef.current.destroy === 'function') {
          viewerRef.current.destroy();
        }
        currentContainer.innerHTML = '';
      }

      // Default options
      const defaultOptions = {
        pgn,
        showMoves: true, 
        showClocks: true,
        scrollToMove: true,
        boardTheme: 'blue',
        pieceSet: 'cburnett',
        showCoords: true,
      };

      // Initialize directly with the imported library
      viewerRef.current = LichessPgnViewerLib(
        currentContainer, 
        { ...defaultOptions, ...options }
      );

      setError(null);

      return () => {
        // Clean up on unmount using captured ref
        if (viewerRef.current && typeof viewerRef.current.destroy === 'function') {
          viewerRef.current.destroy();
        }
        if (currentContainer) {
          currentContainer.innerHTML = '';
        }
        viewerRef.current = null;
      };
    } catch (error) {
      console.error('Error initializing Lichess PGN Viewer:', error);
      setError(error.message || "Failed to initialize PGN viewer");
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
      
      {/* Show fallback if there's an error */}
      {error && pgn && <PgnFallback pgn={pgn} title="PGN Content" />}
      
      {/* Fallback for empty PGN */}
      {!pgn && (
        <div className="p-4 text-gray-500 text-center">
          No PGN content available to display.
        </div>
      )}
    </div>
  );
};

export default LichessPgnViewer;

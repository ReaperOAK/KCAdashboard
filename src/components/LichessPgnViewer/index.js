import React, { useEffect, useRef } from 'react';

// Import the compiled JS version directly instead of the TypeScript source
import LichessPgnViewerLib from 'lichess-pgn-viewer/dist/lichess-pgn-viewer';
import 'lichess-pgn-viewer/dist/lichess-pgn-viewer.css';

/**
 * React component that wraps the Lichess PGN Viewer library
 * @param {Object} props Component props
 * @param {string} props.pgn - PGN string to render
 * @param {Object} props.options - Additional options for the viewer
 */
const LichessPgnViewer = ({ pgn, options = {} }) => {
  const containerRef = useRef(null);
  const viewerRef = useRef(null);

  useEffect(() => {
    if (!pgn || !containerRef.current) return;

    try {
      // Clean up previous instance if it exists
      if (viewerRef.current) {
        containerRef.current.innerHTML = '';
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

      // Initialize the PGN viewer with merged options
      viewerRef.current = LichessPgnViewerLib(
        containerRef.current, 
        { ...defaultOptions, ...options }
      );

      return () => {
        // Clean up on unmount
        if (viewerRef.current && typeof viewerRef.current.destroy === 'function') {
          viewerRef.current.destroy();
          viewerRef.current = null;
        }
      };
    } catch (error) {
      console.error('Error initializing Lichess PGN Viewer:', error);
      if (containerRef.current) {
        containerRef.current.innerHTML = 
          '<div class="p-4 text-red-600">Error loading PGN viewer. Please try again.</div>';
      }
    }
  }, [pgn, options]);

  return (
    <div className="lichess-pgn-viewer-wrapper w-full h-full">
      <div 
        ref={containerRef} 
        className="w-full h-full"
        style={{ minHeight: '400px' }}
      ></div>
      
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

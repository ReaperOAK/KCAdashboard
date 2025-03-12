import React, { useEffect, useRef, useState } from 'react';

// Import the package exactly as shown in the documentation
import LichessPgnViewerLib from 'lichess-pgn-viewer';
// Import the CSS for styling
import 'lichess-pgn-viewer/dist/lichess-pgn-viewer.css';
import PgnFallback from './fallback';

/**
 * React component that wraps the Lichess PGN Viewer library
 */
const LichessPgnViewer = ({ pgn, options = {}, containerClassName = "" }) => {
  const containerRef = useRef(null);
  const viewerRef = useRef(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!pgn || !containerRef.current) return;

    // Store container reference to avoid cleanup issues
    const currentContainer = containerRef.current;
    
    try {
      // Clean up previous instance if it exists
      if (viewerRef.current && typeof viewerRef.current.destroy === 'function') {
        viewerRef.current.destroy();
      }
      currentContainer.innerHTML = '';
      
      // Initialize with default options merged with user provided options
      viewerRef.current = LichessPgnViewerLib(currentContainer, {
        pgn: pgn,
        showPlayers: 'auto',
        showClocks: true,
        showMoves: 'auto',
        scrollToMove: true,
        keyboardToMove: true, 
        orientation: undefined,
        initialPly: 0,
        chessground: {
          animation: { duration: 250 },
          highlight: { lastMove: true, check: true },
          movable: { free: false },
        },
        drawArrows: true,
        menu: {
          getPgn: { enabled: true },
          practiceWithComputer: { enabled: true },
          analysisBoard: { enabled: true },
        },
        ...options
      });
      
      // Adjust the layout based on container size
      setTimeout(() => {
        // Try to make the board more responsive
        const boardElement = currentContainer.querySelector('.lpv__board');
        const movesElement = currentContainer.querySelector('.lpv__moves');
        
        if (boardElement && movesElement) {
          const container = currentContainer.parentElement;
          const containerHeight = container.clientHeight;
          
          // If container is small, adjust layout
          if (containerHeight < 600) {
            boardElement.style.maxHeight = '350px';
            movesElement.style.maxHeight = '150px';
            movesElement.style.overflow = 'auto';
          }
        }
      }, 500);
      
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
    }
  }, [pgn, options]);

  // If there's an error, show the fallback component
  if (error) {
    return <PgnFallback pgn={pgn} title="PGN Analysis (Fallback View)" />;
  }

  return (
    <div className={`lichess-pgn-viewer-wrapper w-full h-full ${containerClassName}`}>
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

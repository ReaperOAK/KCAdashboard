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

  // Function to handle resize and adjust the board
  const handleResize = () => {
    if (!containerRef.current || !viewerRef.current) return;

    try {
      // Find the board element
      const boardElement = containerRef.current.querySelector('.lpv__board');
      const mainElement = containerRef.current.querySelector('.lpv');
      const container = containerRef.current;
      
      if (boardElement && mainElement) {
        // Calculate available width and height
        const containerWidth = container.clientWidth;
        const containerHeight = container.clientHeight;

        // Force the board to be square and fit within the container
        const boardSize = Math.min(containerWidth - 20, containerHeight - 80);
        if (boardSize > 100) {
          mainElement.style.width = '100%';
          mainElement.style.height = `${containerHeight}px`;
          
          // Force redraw if needed
          if (viewerRef.current && typeof viewerRef.current.redraw === 'function') {
            viewerRef.current.redraw();
          }
        }
      }
    } catch (e) {
      console.error('Error adjusting board size:', e);
    }
  };

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
      
      // Add responsive styles to container
      currentContainer.style.display = 'flex';
      currentContainer.style.flexDirection = 'column';
      currentContainer.style.width = '100%';
      currentContainer.style.height = '100%';
      
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
      
      // Use both ResizeObserver and window resize event for better coverage
      const resizeObserver = new ResizeObserver(() => {
        handleResize();
      });
      
      resizeObserver.observe(currentContainer);
      
      // Add window resize listener
      window.addEventListener('resize', handleResize);
      
      // Initial adjustment
      setTimeout(handleResize, 100);
      
      setError(null);
      
      return () => {
        // Clean up on unmount
        if (viewerRef.current && typeof viewerRef.current.destroy === 'function') {
          viewerRef.current.destroy();
        }
        viewerRef.current = null;
        resizeObserver.disconnect();
        window.removeEventListener('resize', handleResize);
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
        style={{ 
          position: 'relative',
          aspectRatio: 'auto'
        }}
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

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
  const resizeObserverRef = useRef(null);
  const [error, setError] = useState(null);

  // Improved function to handle resize and adjust the board
  const handleResize = () => {
    if (!containerRef.current || !viewerRef.current) return;

    try {
      // Get the board container element
      const lpvElement = containerRef.current.querySelector('.lpv');
      if (lpvElement) {
        // Ensure proper layout adjustment
        const boardElement = lpvElement.querySelector('.lpv__board');
        const cgWrap = boardElement?.querySelector('.cg-wrap');
        
        if (boardElement && cgWrap) {
          // Let the layout adjust naturally
          setTimeout(() => {
            // Redraw with proper dimensions
            if (viewerRef.current && typeof viewerRef.current.redraw === 'function') {
              viewerRef.current.redraw();
            }
          }, 50);
        }
      }
    } catch (e) {
      console.error('Error adjusting board size:', e);
    }
  };

  // Effect for cleaning up on unmount
  useEffect(() => {
    return () => {
      // Clean up on unmount
      if (viewerRef.current && typeof viewerRef.current.destroy === 'function') {
        viewerRef.current.destroy();
      }
      
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect();
      }
      
      window.removeEventListener('resize', handleResize);
    };
  }, []);

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
      
      // Clean up any existing observer
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect();
      }
      
      // Wait for next frame to ensure container has dimensions
      requestAnimationFrame(() => {
        // Initialize with default options merged with user provided options
        viewerRef.current = LichessPgnViewerLib(currentContainer, {
          pgn: pgn,
          showPlayers: 'auto',
          showClocks: true,
          showMoves: 'right', // Force moves to the right instead of auto
          scrollToMove: true,
          keyboardToMove: true, 
          orientation: undefined,
          initialPly: 0,
          classes: 'kca-themed-viewer',
          chessground: {
            animation: { duration: 250 },
            highlight: { lastMove: true, check: true },
            movable: { free: false },
            responsive: true
          },
          drawArrows: true,
          viewOnly: true,
          resizable: true,
          menu: {
            getPgn: { enabled: true },
            practiceWithComputer: { enabled: true },
            analysisBoard: { enabled: true },
          },
          ...options
        });
        
        // Create new ResizeObserver with ref
        resizeObserverRef.current = new ResizeObserver(() => {
          // Don't call immediately, let the layout stabilize first
          window.requestAnimationFrame(handleResize);
        });
        
        // Observe the container and the internal lpv element if it exists
        resizeObserverRef.current.observe(currentContainer);
        const lpvEl = currentContainer.querySelector('.lpv');
        if (lpvEl) {
          resizeObserverRef.current.observe(lpvEl);
        }
        
        window.addEventListener('resize', handleResize);
        
        // Initial adjustment after a delay to ensure full rendering
        setTimeout(handleResize, 200);
      });
      
      setError(null);
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
    <div className={`lichess-pgn-viewer-wrapper w-full h-full ${containerClassName}`} 
         style={{ display: 'flex', flexDirection: 'column', minHeight: '300px' }}>
      <div 
        ref={containerRef} 
        className="w-full h-full"
        style={{ 
          position: 'relative',
          flex: '1 1 auto',
          minHeight: '300px',
          display: 'flex',
          flexDirection: 'column'
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

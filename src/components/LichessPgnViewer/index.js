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
      // Trigger global resize event
      window.dispatchEvent(new Event('resize'));
      
      const lpvElement = containerRef.current.querySelector('.lpv');
      if (lpvElement) {
        // Apply a slight delay to ensure layout is complete
        setTimeout(() => {
          // Force redraw if needed
          if (viewerRef.current && typeof viewerRef.current.redraw === 'function') {
            viewerRef.current.redraw();
          }
        }, 50);
      }
    } catch (e) {
      console.error('Error adjusting board size:', e);
    }
  };

  // Add custom CSS to fix layout issues
  useEffect(() => {
    // Add custom CSS to ensure proper layout
    const styleEl = document.createElement('style');
    styleEl.innerHTML = `
      .lichess-pgn-viewer-wrapper .lpv {
        display: flex !important;
        flex-direction: row !important;
        height: 100% !important;
        overflow: hidden !important;
      }
      .lichess-pgn-viewer-wrapper .lpv__board {
        flex: 0 0 auto !important;
        min-width: 300px !important;
        height: 100% !important;
        aspect-ratio: 1 / 1 !important;
      }
      .lichess-pgn-viewer-wrapper .lpv__side {
        flex: 1 1 auto !important;
        overflow: auto !important;
        max-height: 100% !important;
      }
      .lichess-pgn-viewer-wrapper .cg-wrap {
        width: 100% !important;
        height: 100% !important;
      }
    `;
    document.head.appendChild(styleEl);
    
    return () => {
      document.head.removeChild(styleEl);
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
      
      // Set key dimensions for proper sizing - make this a square container
      currentContainer.style.display = 'flex';
      currentContainer.style.flexDirection = 'column';
      currentContainer.style.width = '100%';
      currentContainer.style.height = '100%';
      currentContainer.style.minHeight = '400px'; // Add minimum height
      
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
          handleResize();
        });
        
        resizeObserverRef.current.observe(currentContainer);
        window.addEventListener('resize', handleResize);
        
        // Initial adjustment after a delay to ensure full rendering
        setTimeout(handleResize, 200);
      });
      
      setError(null);
      
      return () => {
        // Clean up on unmount
        if (viewerRef.current && typeof viewerRef.current.destroy === 'function') {
          viewerRef.current.destroy();
        }
        viewerRef.current = null;
        
        if (resizeObserverRef.current) {
          resizeObserverRef.current.disconnect();
          resizeObserverRef.current = null;
        }
        
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
    <div className={`lichess-pgn-viewer-wrapper w-full h-full ${containerClassName}`} 
         style={{ minHeight: '400px', display: 'flex', flexDirection: 'column' }}>
      <div 
        ref={containerRef} 
        className="w-full h-full"
        style={{ 
          position: 'relative',
          flex: '1 1 auto',
          minHeight: '400px'
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

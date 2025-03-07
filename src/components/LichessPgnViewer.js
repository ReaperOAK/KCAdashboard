import React, { useEffect, useRef } from 'react';
import LichessPgnViewerPackage from 'lichess-pgn-viewer';
import 'lichess-pgn-viewer/dist/lichess-pgn-viewer.css';

/**
 * React component wrapper for lichess-pgn-viewer
 */
const LichessPgnViewer = ({ pgn, options = {} }) => {
  const containerRef = useRef(null);
  const viewerRef = useRef(null);

  useEffect(() => {
    if (!pgn || !containerRef.current) return;

    try {
      // Clean up previous instance if it exists
      if (viewerRef.current && viewerRef.current.destroy) {
        viewerRef.current.destroy();
        viewerRef.current = null;
      }

      // Initialize the viewer with the given PGN and options
      const defaultOptions = {
        pgn: pgn,
        showPlayers: true,
        showClocks: true,
        showMoves: 'right',
        showControls: true,
        scrollToMove: true,
        keyboardToMove: true,
        orientation: undefined, // will use orientation from PGN
        initialPly: 0,
        chessground: {
          highlight: { lastMove: true, check: true },
          animation: { enabled: true },
          movable: { free: false },
          viewOnly: false,
          coordinates: true,
          drawable: { enabled: true, defaultSnapToValidMove: true }
        },
        menu: {
          getPgn: { enabled: true },
          practiceWithComputer: { enabled: true },
          analysisBoard: { enabled: true }
        }
      };

      // Merge defaults with provided options
      const mergedOptions = { ...defaultOptions, ...options };
      
      // Initialize the lichess-pgn-viewer
      viewerRef.current = LichessPgnViewerPackage(containerRef.current, mergedOptions);
      
      // Example of using methods on the viewer
      console.log('Lichess PGN Viewer initialized successfully');
      
    } catch (error) {
      console.error('Error initializing Lichess PGN Viewer:', error);
      
      // Fallback to simpler iframe-based solution
      containerRef.current.innerHTML = '';
      const iframe = document.createElement('iframe');
      iframe.style.width = '100%';
      iframe.style.height = '500px';
      iframe.style.border = 'none';
      iframe.title = 'Lichess Analysis';
      iframe.src = `https://lichess.org/analysis/pgn/${encodeURIComponent(pgn)}`;
      iframe.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-popups allow-forms');
      containerRef.current.appendChild(iframe);
    }

    return () => {
      // Clean up on unmount
      if (viewerRef.current && viewerRef.current.destroy) {
        viewerRef.current.destroy();
      }
    };
  }, [pgn, options]);

  return (
    <div className="lichess-pgn-viewer-wrapper">
      <div 
        ref={containerRef} 
        className="lichess-pgn-viewer" 
        style={{ width: '100%', minHeight: '500px' }}
      ></div>
    </div>
  );
};

export default LichessPgnViewer;

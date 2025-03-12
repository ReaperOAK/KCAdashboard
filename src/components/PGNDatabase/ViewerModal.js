import React, { useEffect, useRef } from 'react';
import LichessPgnViewer from '../../components/LichessPgnViewer';

const ViewerModal = ({ show, onClose, pgn, viewMode }) => {
  // Create refs for the container and board - moved to top of component
  const containerRef = useRef(null);
  const viewerRef = useRef(null);
  
  // Add resize observer to adjust board size to container
  useEffect(() => {
    // Only proceed if the modal is shown, has pgn data, and container is mounted
    if (!show || !pgn || !containerRef.current) return;
    
    const resizeObserver = new ResizeObserver(entries => {
      if (viewerRef.current) {
        const boardContainer = viewerRef.current.querySelector('.cg-wrap');
        if (boardContainer) {
          // Trigger resize event to make Lichess viewer readjust
          window.dispatchEvent(new Event('resize'));
        }
      }
    });
    
    resizeObserver.observe(containerRef.current);
    
    return () => {
      resizeObserver.disconnect();
    };
  }, [show, pgn]);

  // Early return for rendering, after hooks are called
  if (!show || !pgn) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl p-6 max-w-5xl w-full h-[85vh] flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-[#200e4a]">{pgn.title}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>
        
        {pgn.description && (
          <p className="text-gray-600 mb-4">{pgn.description}</p>
        )}
        
        <div 
          ref={containerRef}
          className="flex-1 overflow-auto relative w-full" 
        >
          <div 
            ref={viewerRef} 
            className="w-full h-full flex items-center justify-center"
          >
            <LichessPgnViewer 
              key={`pgn-${pgn.id}-${Date.now()}`}
              pgn={pgn.pgn_content}
              options={{
                showPlayers: 'auto',
                showClocks: true,
                showMoves: 'auto',
                showControls: true,
                scrollToMove: true,
                keyboardToMove: true,
                boardTheme: 'blue',
                pieceSet: 'cburnett',
                showCoords: true,
                drawArrows: true,
                viewOnly: true,
                resizable: true,
                chessground: {
                  animation: { duration: 250 },
                  highlight: { lastMove: true, check: true },
                  movable: { free: false },
                  responsive: true,
                },
                menu: {
                  getPgn: { enabled: true },
                  practiceWithComputer: { enabled: true },
                  analysisBoard: { enabled: true },
                }
              }}
            />
          </div>
        </div>
        <div className="flex justify-between items-center mt-4 pt-3 border-t border-gray-200">
          <div className="text-sm text-gray-600">
            <span className="font-semibold">Category:</span> {pgn.category}
            {viewMode === 'shared' && (
              <span className="ml-4">
                <span className="font-semibold">Shared by:</span> {pgn.shared_by}
              </span>
            )}
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => {
                // Force re-render the viewer by trigger onClose and reopening
                onClose();
                setTimeout(() => onClose(pgn), 50);
              }}
              className="px-3 py-1 bg-gray-200 text-gray-700 rounded text-sm hover:bg-gray-300"
            >
              Reload Viewer
            </button>
            <a 
              href={`data:text/plain;charset=utf-8,${encodeURIComponent(pgn.pgn_content)}`}
              download={`${pgn.title}.pgn`}
              className="px-3 py-1 bg-[#461fa3] text-white rounded text-sm hover:bg-[#7646eb]"
            >
              Download PGN
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewerModal;

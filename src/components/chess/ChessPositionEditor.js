import React, { useState, useEffect } from 'react';
import { Chessboard } from 'react-chessboard';
import { Chess } from 'chess.js';
import { FaUndo, FaRedo, FaEraser, FaHome } from 'react-icons/fa';

const ChessPositionEditor = ({
  initialPosition = 'start',
  orientation = 'white',
  onPositionChange = null,
  width = 400,
  className = ''
}) => {
  const [game, setGame] = useState(new Chess(initialPosition !== 'start' ? initialPosition : undefined));
  const [moveHistory, setMoveHistory] = useState([]);
  const [currentHistoryIndex, setCurrentHistoryIndex] = useState(-1);

  useEffect(() => {
    // Reset game when initial position changes
    const newGame = new Chess(initialPosition !== 'start' ? initialPosition : undefined);
    setGame(newGame);
    setMoveHistory([]);
    setCurrentHistoryIndex(-1);
  }, [initialPosition]);

  const onDrop = (sourceSquare, targetSquare) => {
    const move = game.move({
      from: sourceSquare,
      to: targetSquare,
      promotion: 'q' // always promote to queen for simplicity
    });

    if (move === null) return false;

    const newGame = new Chess(game.fen());
    setGame(newGame);

    // Update history for undo/redo functionality
    const newHistory = moveHistory.slice(0, currentHistoryIndex + 1);
    newHistory.push(game.fen());
    setMoveHistory(newHistory);
    setCurrentHistoryIndex(newHistory.length - 1);

    // Notify parent component of position change
    if (onPositionChange) {
      onPositionChange(newGame.fen());
    }

    return true;
  };

  const undoMove = () => {
    if (currentHistoryIndex > 0) {
      const previousPosition = moveHistory[currentHistoryIndex - 1];
      const newGame = new Chess(previousPosition);
      setGame(newGame);
      setCurrentHistoryIndex(currentHistoryIndex - 1);
      
      if (onPositionChange) {
        onPositionChange(newGame.fen());
      }
    } else if (currentHistoryIndex === 0) {
      // Go to initial position
      const newGame = new Chess(initialPosition !== 'start' ? initialPosition : undefined);
      setGame(newGame);
      setCurrentHistoryIndex(-1);
      
      if (onPositionChange) {
        onPositionChange(newGame.fen());
      }
    }
  };

  const redoMove = () => {
    if (currentHistoryIndex < moveHistory.length - 1) {
      const nextPosition = moveHistory[currentHistoryIndex + 1];
      const newGame = new Chess(nextPosition);
      setGame(newGame);
      setCurrentHistoryIndex(currentHistoryIndex + 1);
      
      if (onPositionChange) {
        onPositionChange(newGame.fen());
      }
    }
  };

  const resetToStart = () => {
    const newGame = new Chess();
    setGame(newGame);
    setMoveHistory([]);
    setCurrentHistoryIndex(-1);
    
    if (onPositionChange) {
      onPositionChange(newGame.fen());
    }
  };

  const clearBoard = () => {
    // Create an empty board FEN
    const emptyFen = '8/8/8/8/8/8/8/8 w - - 0 1';
    const newGame = new Chess(emptyFen);
    setGame(newGame);
    setMoveHistory([]);
    setCurrentHistoryIndex(-1);
    
    if (onPositionChange) {
      onPositionChange(newGame.fen());
    }
  };

  return (
    <div className={`chess-position-editor ${className}`}>
      <div className="mb-4 flex gap-2 justify-center">
        <button
          onClick={undoMove}
          disabled={currentHistoryIndex < 0}
          className={`px-3 py-1 rounded text-sm flex items-center gap-1 ${
            currentHistoryIndex < 0 
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
              : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
          }`}
          title="Undo move"
        >
          <FaUndo className="w-3 h-3" />
          Undo
        </button>
        
        <button
          onClick={redoMove}
          disabled={currentHistoryIndex >= moveHistory.length - 1}
          className={`px-3 py-1 rounded text-sm flex items-center gap-1 ${
            currentHistoryIndex >= moveHistory.length - 1
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
          }`}
          title="Redo move"
        >
          <FaRedo className="w-3 h-3" />
          Redo
        </button>
        
        <button
          onClick={resetToStart}
          className="px-3 py-1 bg-green-100 text-green-700 hover:bg-green-200 rounded text-sm flex items-center gap-1"
          title="Reset to starting position"
        >
          <FaHome className="w-3 h-3" />
          Start
        </button>
        
        <button
          onClick={clearBoard}
          className="px-3 py-1 bg-red-100 text-red-700 hover:bg-red-200 rounded text-sm flex items-center gap-1"
          title="Clear board"
        >
          <FaEraser className="w-3 h-3" />
          Clear
        </button>
      </div>
      
      <div className="relative">
        <Chessboard
          position={game.fen()}
          onPieceDrop={onDrop}
          boardWidth={width}
          boardOrientation={orientation}
          areArrowsAllowed={false}
          arePiecesDraggable={true}
        />
      </div>

      <div className="mt-3 text-center">
        <div className="text-xs text-gray-500 bg-gray-100 p-2 rounded font-mono break-all">
          FEN: {game.fen()}
        </div>
      </div>
    </div>
  );
};

export default ChessPositionEditor;

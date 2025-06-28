import React, { useState, useEffect } from 'react';
import { Chessboard } from 'react-chessboard';
import { FaEraser, FaHome, FaQuestionCircle } from 'react-icons/fa';

// import { Chess } from 'chess.js';
// --- Utility: FEN state for free editing ---
function fenToBoardArray(fen) {
  // Only parse the piece placement part
  const rows = fen.split(' ')[0].split('/');
  return rows.map(row => {
    const arr = [];
    for (const c of row) {
      if (!isNaN(c)) {
        for (let i = 0; i < Number(c); i++) arr.push(null);
      } else {
        arr.push(c);
      }
    }
    return arr;
  });
}
function boardArrayToFen(boardArr) {
  // Only build the piece placement part
  return boardArr.map(row => {
    let s = '';
    let empty = 0;
    for (const c of row) {
      if (!c) empty++;
      else {
        if (empty) s += empty;
        empty = 0;
        s += c;
      }
    }
    if (empty) s += empty;
    return s;
  }).join('/') + ' w - - 0 1';
}


const ChessPositionEditor = ({
  initialPosition = 'start',
  orientation = 'white',
  onPositionChange = null,
  width = 400,
  className = ''
}) => {
  // Free mode board state: 8x8 array of piece codes (KQRBNP/kqrbnp) or null
  const [boardArr, setBoardArr] = useState(() =>
    initialPosition === 'start'
      ? [
          ['r','n','b','q','k','b','n','r'],
          ['p','p','p','p','p','p','p','p'],
          [null,null,null,null,null,null,null,null],
          [null,null,null,null,null,null,null,null],
          [null,null,null,null,null,null,null,null],
          [null,null,null,null,null,null,null,null],
          ['P','P','P','P','P','P','P','P'],
          ['R','N','B','Q','K','B','N','R']
        ]
      : fenToBoardArray(initialPosition)
  );
  // FEN string for display
  const fen = boardArrayToFen(boardArr);

  useEffect(() => {
    // Reset board when initial position changes
    setBoardArr(
      initialPosition === 'start'
        ? [
            ['r','n','b','q','k','b','n','r'],
            ['p','p','p','p','p','p','p','p'],
            [null,null,null,null,null,null,null,null],
            [null,null,null,null,null,null,null,null],
            [null,null,null,null,null,null,null,null],
            [null,null,null,null,null,null,null,null],
            ['P','P','P','P','P','P','P','P'],
            ['R','N','B','Q','K','B','N','R']
          ]
        : fenToBoardArray(initialPosition)
    );
  }, [initialPosition]);

  // Allow drag-and-drop piece movement in free mode
  const onDrop = (sourceSquare, targetSquare) => {
    // Convert squares to indices
    const fileFrom = sourceSquare.charCodeAt(0) - 'a'.charCodeAt(0);
    const rankFrom = 8 - parseInt(sourceSquare[1], 10);
    const fileTo = targetSquare.charCodeAt(0) - 'a'.charCodeAt(0);
    const rankTo = 8 - parseInt(targetSquare[1], 10);
    const newArr = boardArr.map(row => [...row]);
    const movingPiece = newArr[rankFrom][fileFrom];
    if (!movingPiece) return false;
    // Prevent moving the only king off the board
    if ((movingPiece === 'K' || movingPiece === 'k') && newArr[rankTo][fileTo] === null) {
      let count = 0;
      for (let r = 0; r < 8; r++) {
        for (let f = 0; f < 8; f++) {
          if (newArr[r][f] === movingPiece) count++;
        }
      }
      if (count <= 1 && sourceSquare !== targetSquare) {
        // Only allow moving, not removing
      }
    }
    newArr[rankTo][fileTo] = movingPiece;
    newArr[rankFrom][fileFrom] = null;
    setBoardArr(newArr);
    if (onPositionChange) {
      onPositionChange(boardArrayToFen(newArr));
    }
    return true;
  };

  // Undo/redo not supported in free mode (no-ops, remove UI below)
  // const undoMove = () => {};
  // const redoMove = () => {};
  const resetToStart = () => {
    setBoardArr([
      ['r','n','b','q','k','b','n','r'],
      ['p','p','p','p','p','p','p','p'],
      [null,null,null,null,null,null,null,null],
      [null,null,null,null,null,null,null,null],
      [null,null,null,null,null,null,null,null],
      [null,null,null,null,null,null,null,null],
      ['P','P','P','P','P','P','P','P'],
      ['R','N','B','Q','K','B','N','R']
    ]);
    if (onPositionChange) {
      onPositionChange(boardArrayToFen([
        ['r','n','b','q','k','b','n','r'],
        ['p','p','p','p','p','p','p','p'],
        [null,null,null,null,null,null,null,null],
        [null,null,null,null,null,null,null,null],
        [null,null,null,null,null,null,null,null],
        [null,null,null,null,null,null,null,null],
        ['P','P','P','P','P','P','P','P'],
        ['R','N','B','Q','K','B','N','R']
      ]));
    }
  };
  const clearBoard = () => {
    // Place only white king on e1 and black king on e8 to keep FEN valid
    const empty = Array(8).fill(null).map(() => Array(8).fill(null));
    empty[0][4] = 'k'; // black king on e8
    empty[7][4] = 'K'; // white king on e1
    setBoardArr(empty);
    if (onPositionChange) {
      onPositionChange(boardArrayToFen(empty));
    }
  };

  // --- Piece Palette for Drag & Drop ---
  const [selectedPiece, setSelectedPiece] = useState(null);
  const pieceTypes = [
    { code: 'wK', label: 'White King' },
    { code: 'wQ', label: 'White Queen' },
    { code: 'wR', label: 'White Rook' },
    { code: 'wB', label: 'White Bishop' },
    { code: 'wN', label: 'White Knight' },
    { code: 'wP', label: 'White Pawn' },
    { code: 'bK', label: 'Black King' },
    { code: 'bQ', label: 'Black Queen' },
    { code: 'bR', label: 'Black Rook' },
    { code: 'bB', label: 'Black Bishop' },
    { code: 'bN', label: 'Black Knight' },
    { code: 'bP', label: 'Black Pawn' },
  ];

  // Place or remove a piece on the board
  const handleSquareClick = (square) => {
    if (!selectedPiece) return;
    // Convert square (e.g. 'e4') to boardArr indices
    const file = square.charCodeAt(0) - 'a'.charCodeAt(0);
    const rank = 8 - parseInt(square[1], 10);
    const newArr = boardArr.map(row => [...row]);

    // Prevent removing the only white or black king
    if (selectedPiece === 'empty') {
      const piece = newArr[rank][file];
      if (piece === 'K' || piece === 'k') {
        // Count all kings of this color
        let count = 0;
        for (let r = 0; r < 8; r++) {
          for (let f = 0; f < 8; f++) {
            if (newArr[r][f] === piece) count++;
          }
        }
        if (count <= 1) return; // Don't allow removing the last king
      }
      newArr[rank][file] = null;
    } else {
      // Map 'wK' to 'K', 'bQ' to 'q', etc.
      const piece = selectedPiece[1];
      newArr[rank][file] = selectedPiece[0] === 'w' ? piece.toUpperCase() : piece.toLowerCase();
    }
    setBoardArr(newArr);
    if (onPositionChange) {
      onPositionChange(boardArrayToFen(newArr));
    }
  };

  // Render piece palette
  const renderPiecePalette = () => (
    <div className="flex flex-wrap gap-2 justify-center mb-2">
      {pieceTypes.map(piece => (
        <button
          key={piece.code}
          className={`px-2 py-1 rounded border flex items-center gap-1 text-xs font-mono ${selectedPiece === piece.code ? 'bg-blue-200 border-blue-500' : 'bg-white border-gray-300 hover:bg-blue-100'}`}
          onClick={() => setSelectedPiece(piece.code)}
          title={piece.label}
        >
          <span>{piece.code}</span>
        </button>
      ))}
      <button
        className={`px-2 py-1 rounded border text-xs font-mono ${selectedPiece === 'empty' ? 'bg-red-200 border-red-500' : 'bg-white border-gray-300 hover:bg-red-100'}`}
        onClick={() => setSelectedPiece('empty')}
        title="Remove piece"
      >
        Empty
      </button>
    </div>
  );

  return (
    <div className={`chess-position-editor ${className}`}>
      <div className="flex items-center gap-2 mb-2">
        <span className="font-semibold text-sm">FEN Builder</span>
        <FaQuestionCircle className="text-blue-400 ml-1" title="Drag pieces or use the palette to set up a position. FEN is a chess position notation. Use 'Clear' to start from empty, 'Start' for the standard opening." />
      </div>
      {renderPiecePalette()}
      <div className="mb-4 flex gap-2 justify-center">
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
          position={fen}
          onPieceDrop={onDrop}
          onSquareClick={handleSquareClick}
          boardWidth={width}
          boardOrientation={orientation}
          areArrowsAllowed={false}
          arePiecesDraggable={true}
        />
      </div>
      <div className="mt-3 text-center">
        <div className="text-xs text-gray-500 bg-gray-100 p-2 rounded font-mono break-all">
          FEN: {fen}
        </div>
      </div>
    </div>
  );
};

export default ChessPositionEditor;

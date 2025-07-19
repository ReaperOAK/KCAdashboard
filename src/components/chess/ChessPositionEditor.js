
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Chessboard } from 'react-chessboard';
import { FaEraser, FaHome, FaQuestionCircle } from 'react-icons/fa';


// --- Utility: FEN state for free editing ---
const fenToBoardArray = (fen) => {
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
};

const boardArrayToFen = (boardArr) => {
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
};



// --- Memoized constants ---
const START_BOARD = [
  ['r','n','b','q','k','b','n','r'],
  ['p','p','p','p','p','p','p','p'],
  [null,null,null,null,null,null,null,null],
  [null,null,null,null,null,null,null,null],
  [null,null,null,null,null,null,null,null],
  [null,null,null,null,null,null,null,null],
  ['P','P','P','P','P','P','P','P'],
  ['R','N','B','Q','K','B','N','R']
];

const EMPTY_KINGS_BOARD = () => {
  const empty = Array(8).fill(null).map(() => Array(8).fill(null));
  empty[0][4] = 'k';
  empty[7][4] = 'K';
  return empty;
};

const PIECE_TYPES = [
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

// --- PiecePalette: Memoized for performance ---
const PiecePalette = React.memo(function PiecePalette({ selectedPiece, onSelect }) {
  return (
    <div className="flex flex-wrap gap-3 justify-center mb-4 w-full" role="toolbar" aria-label="Piece palette">
      {PIECE_TYPES.map(piece => (
        <button
          key={piece.code}
          type="button"
          className={
            `px-3 py-2 rounded-xl border flex items-center gap-1 text-sm font-mono focus:outline-none focus-visible:ring-2 focus-visible:ring-accent shadow-sm transition-all duration-200 ${selectedPiece === piece.code ? 'bg-accent/20 border-accent text-accent' : 'bg-background-light border-gray-light hover:bg-accent/10 hover:text-accent'}`
          }
          aria-pressed={selectedPiece === piece.code}
          aria-label={piece.label}
          tabIndex={0}
          onClick={() => onSelect(piece.code)}
        >
          <span aria-hidden="true">{piece.code}</span>
        </button>
      ))}
      <button
        type="button"
        className={`px-3 py-2 rounded-xl border text-sm font-mono focus:outline-none focus-visible:ring-2 focus-visible:ring-accent shadow-sm transition-all duration-200 ${selectedPiece === 'empty' ? 'bg-highlight/20 border-highlight text-highlight' : 'bg-background-light border-gray-light hover:bg-highlight/10 hover:text-highlight'}`}
        aria-pressed={selectedPiece === 'empty'}
        aria-label="Remove piece"
        tabIndex={0}
        onClick={() => onSelect('empty')}
      >
        Empty
      </button>
    </div>
  );
});

// --- ControlBar: Memoized for performance ---
const ControlBar = React.memo(function ControlBar({ onReset, onClear }) {
  return (
    <div className="mb-6 flex gap-4 justify-center w-full">
      <button
        type="button"
        onClick={onReset}
        className="px-4 py-2 bg-success/10 text-success hover:bg-success/20 rounded-xl text-base flex items-center gap-2 font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-accent shadow-sm transition-all duration-200"
        title="Reset to starting position"
        aria-label="Reset to starting position"
      >
        <FaHome className="w-4 h-4" aria-hidden="true" />
        Start
      </button>
      <button
        type="button"
        onClick={onClear}
        className="px-4 py-2 bg-highlight/10 text-highlight hover:bg-highlight/20 rounded-xl text-base flex items-center gap-2 font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-accent shadow-sm transition-all duration-200"
        title="Clear board"
        aria-label="Clear board"
      >
        <FaEraser className="w-4 h-4" aria-hidden="true" />
        Clear
      </button>
    </div>
  );
});

// --- FENDisplay: Memoized for performance ---
const FENDisplay = React.memo(function FENDisplay({ fen }) {
  return (
    <div className="mt-4 text-center w-full">
      <div className="text-sm text-gray-dark bg-gray-light p-3 rounded-xl font-mono break-all select-all shadow-sm" aria-label="FEN string">
        <span className="font-semibold text-primary">FEN:</span> {fen}
      </div>
    </div>
  );
});

// --- Main Editor Component ---
export function ChessPositionEditor({
  initialPosition = 'start',
  orientation = 'white',
  onPositionChange = null,
  width = 400,
  className = ''
}) {
  // --- State ---
  const [boardArr, setBoardArr] = useState(() =>
    initialPosition === 'start' ? START_BOARD : fenToBoardArray(initialPosition)
  );
  const [selectedPiece, setSelectedPiece] = useState(null);

  // --- FEN string for display ---
  const fen = useMemo(() => boardArrayToFen(boardArr), [boardArr]);

  // --- Reset board when initial position changes ---
  useEffect(() => {
    setBoardArr(initialPosition === 'start' ? START_BOARD : fenToBoardArray(initialPosition));
  }, [initialPosition]);

  // --- Handlers ---
  const handleDrop = useCallback((sourceSquare, targetSquare) => {
    const fileFrom = sourceSquare.charCodeAt(0) - 97;
    const rankFrom = 8 - parseInt(sourceSquare[1], 10);
    const fileTo = targetSquare.charCodeAt(0) - 97;
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
    if (onPositionChange) onPositionChange(boardArrayToFen(newArr));
    return true;
  }, [boardArr, onPositionChange]);

  const handleResetToStart = useCallback(() => {
    setBoardArr(START_BOARD);
    if (onPositionChange) onPositionChange(boardArrayToFen(START_BOARD));
  }, [onPositionChange]);

  const handleClearBoard = useCallback(() => {
    const empty = EMPTY_KINGS_BOARD();
    setBoardArr(empty);
    if (onPositionChange) onPositionChange(boardArrayToFen(empty));
  }, [onPositionChange]);

  const handleSelectPiece = useCallback((pieceCode) => {
    setSelectedPiece(pieceCode);
  }, []);

  const handleSquareClick = useCallback((square) => {
    if (!selectedPiece) return;
    const file = square.charCodeAt(0) - 97;
    const rank = 8 - parseInt(square[1], 10);
    const newArr = boardArr.map(row => [...row]);
    if (selectedPiece === 'empty') {
      const piece = newArr[rank][file];
      if (piece === 'K' || piece === 'k') {
        let count = 0;
        for (let r = 0; r < 8; r++) {
          for (let f = 0; f < 8; f++) {
            if (newArr[r][f] === piece) count++;
          }
        }
        if (count <= 1) return;
      }
      newArr[rank][file] = null;
    } else {
      const piece = selectedPiece[1];
      newArr[rank][file] = selectedPiece[0] === 'w' ? piece.toUpperCase() : piece.toLowerCase();
    }
    setBoardArr(newArr);
    if (onPositionChange) onPositionChange(boardArrayToFen(newArr));
  }, [selectedPiece, boardArr, onPositionChange]);

  // --- Render ---
  return (
    <section className={`chess-position-editor ${className}`.trim()} aria-label="Chess Position Editor">
      <header className="flex items-center gap-2 mb-4">
        <span className="font-semibold text-lg text-primary">FEN Builder</span>
        <FaQuestionCircle className="text-accent ml-1" aria-hidden="true" title="Drag pieces or use the palette to set up a position. FEN is a chess position notation. Use 'Clear' to start from empty, 'Start' for the standard opening." />
      </header>
      <PiecePalette selectedPiece={selectedPiece} onSelect={handleSelectPiece} />
      <ControlBar onReset={handleResetToStart} onClear={handleClearBoard} />
      <div className="relative flex justify-center items-center w-full py-2">
        <Chessboard
          position={fen}
          onPieceDrop={handleDrop}
          onSquareClick={(square) => {
            // For position editor, treat drag and click the same way
            handleSquareClick(square);
          }}
          boardWidth={width}
          boardOrientation={orientation}
          areArrowsAllowed={false}
          arePiecesDraggable={true}
          aria-label="Chessboard editor"
        />
      </div>
      <FENDisplay fen={fen} />
    </section>
  );
}

export default React.memo(ChessPositionEditor);

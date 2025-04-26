import React, { useState, useEffect } from 'react';
import { Chess } from 'chess.js';
import { Chessboard } from 'react-chessboard';

const SimulBoard = ({ 
  id, 
  position, 
  orientation = 'white', 
  allowMoves = false, 
  onMove, 
  opponentName,
  width = 400,
  isActive = false,
  result = null
}) => {
  const [game, setGame] = useState(new Chess());
  const [moveFrom, setMoveFrom] = useState('');
  const [moveSquares, setMoveSquares] = useState({});
  const [optionSquares, setOptionSquares] = useState({});
  
  // Initialize game from FEN position
  useEffect(() => {
    if (position) {
      try {
        const newGame = new Chess();
        newGame.load(position);
        setGame(newGame);
      } catch (error) {
        console.error("Invalid FEN position:", error);
      }
    }
  }, [position]);
  
  // Get the current turn (w or b)
  const currentTurn = game.turn();
  
  // Check if game is over
  const isGameOver = game.isGameOver();
  
  // Function to show possible moves
  const getMoveOptions = (square) => {
    const moves = game.moves({
      square,
      verbose: true
    });
    
    if (moves.length === 0) return;
    
    const newSquares = {};
    moves.forEach(move => {
      newSquares[move.to] = {
        background:
          game.get(move.to) && game.get(move.to).color !== game.get(square).color
            ? 'radial-gradient(circle, rgba(255,0,0,.1) 85%, transparent 85%)'
            : 'radial-gradient(circle, rgba(0,0,0,.1) 25%, transparent 25%)',
        borderRadius: '50%'
      };
    });
    
    newSquares[square] = {
      background: 'rgba(255, 255, 0, 0.4)'
    };
    
    setOptionSquares(newSquares);
  };
  
  // Function to handle square click
  const onSquareClick = (square) => {
    if (!allowMoves || isGameOver) return;
    
    // Check if it's player's turn based on board orientation
    const isWhiteTurn = currentTurn === 'w';
    if ((orientation === 'white' && !isWhiteTurn) || (orientation === 'black' && isWhiteTurn)) {
      return;
    }
    
    // If already have a moveFrom, attempt to make a move
    if (moveFrom) {
      const moveObj = {
        from: moveFrom,
        to: square,
        promotion: 'q' // Default to queen for simplicity
      };
      
      const move = makeMove(moveObj);
      
      // If move is valid, clear move indicators
      if (move) {
        setMoveFrom('');
        setOptionSquares({});
        return;
      }
      
      // If invalid move, try selecting a new square if it has a piece
      const piece = game.get(square);
      if (piece && piece.color === currentTurn) {
        setMoveFrom(square);
        getMoveOptions(square);
      } else {
        // Clear selection if invalid move and no new piece selected
        setMoveFrom('');
        setOptionSquares({});
      }
    } else {
      // No piece selected yet, so select if there's a piece
      const piece = game.get(square);
      if (piece && piece.color === currentTurn) {
        setMoveFrom(square);
        getMoveOptions(square);
      }
    }
  };
  
  // Function to make a move
  const makeMove = (move) => {
    const gameCopy = new Chess(game.fen());
    
    try {
      const result = gameCopy.move(move);
      if (result) {
        setGame(gameCopy);
        
        // Highlight the move
        setMoveSquares({
          [move.from]: { backgroundColor: 'rgba(255, 255, 0, 0.4)' },
          [move.to]: { backgroundColor: 'rgba(255, 255, 0, 0.4)' }
        });
        
        // Call parent onMove handler with the move details
        if (onMove) {
          onMove(id, move, gameCopy.fen());
        }
        
        return result;
      }
      return null;
    } catch (e) {
      return null;
    }
  };
  
  // Function to handle piece drag
  const onPieceDragBegin = (piece, sourceSquare) => {
    if (!allowMoves || isGameOver) return false;
    
    // Check if it's player's turn based on board orientation
    const isWhiteTurn = currentTurn === 'w';
    if ((orientation === 'white' && !isWhiteTurn) || (orientation === 'black' && isWhiteTurn)) {
      return false;
    }
    
    // Only allow dragging player's pieces
    const pieceObj = game.get(sourceSquare);
    if (!pieceObj || pieceObj.color !== currentTurn) {
      return false;
    }
    
    getMoveOptions(sourceSquare);
    return true;
  };
  
  // Function to handle piece drop
  const onPieceDrop = (sourceSquare, targetSquare, piece) => {
    if (!allowMoves || isGameOver) return false;
    
    // Check if it's player's turn based on board orientation
    const isWhiteTurn = currentTurn === 'w';
    if ((orientation === 'white' && !isWhiteTurn) || (orientation === 'black' && isWhiteTurn)) {
      return false;
    }
    
    const move = makeMove({
      from: sourceSquare,
      to: targetSquare,
      promotion: 'q' // Default to queen for simplicity
    });
    
    if (move === null) return false;
    
    // Clear selection after successful move
    setMoveFrom('');
    setOptionSquares({});
    return true;
  };
  
  // Render game status or result
  const renderStatus = () => {
    if (result) {
      return (
        <div className="bg-amber-100 text-orange-700 py-1 px-2 rounded font-semibold text-sm">
          {result === '1-0' ? 'White won' : 
          result === '0-1' ? 'Black won' : 
          result === '1/2-1/2' ? 'Draw' : result}
        </div>
      );
    }
    
    if (isGameOver) {
      if (game.isCheckmate()) return <div className="bg-blue-100 text-blue-800 py-1 px-2 rounded text-sm">Checkmate</div>;
      if (game.isDraw()) return <div className="bg-blue-100 text-blue-800 py-1 px-2 rounded text-sm">Draw</div>;
      if (game.isStalemate()) return <div className="bg-blue-100 text-blue-800 py-1 px-2 rounded text-sm">Stalemate</div>;
      if (game.isThreefoldRepetition()) return <div className="bg-blue-100 text-blue-800 py-1 px-2 rounded text-sm">Draw by repetition</div>;
      if (game.isInsufficientMaterial()) return <div className="bg-blue-100 text-blue-800 py-1 px-2 rounded text-sm">Draw by insufficient material</div>;
      return <div className="bg-blue-100 text-blue-800 py-1 px-2 rounded text-sm">Game over</div>;
    }
    
    return (
      <div className="bg-blue-100 text-blue-800 py-1 px-2 rounded text-sm">
        {game.turn() === 'w' ? 'White' : 'Black'} to move
        {game.inCheck() ? ' (In check)' : ''}
      </div>
    );
  };
  
  return (
    <div className={`mb-5 rounded-lg overflow-hidden bg-white shadow-md transition-all duration-300 max-w-[320px] cursor-pointer flex flex-col ${isActive ? 'shadow-[0_0_0_3px_#3498db,0_2px_10px_rgba(0,0,0,0.2)] scale-[1.02]' : ''}`}>
      <div className="flex justify-between items-center px-4 py-3 bg-gray-50 border-b border-gray-100">
        <div className="font-semibold text-gray-800">vs {opponentName}</div>
        {renderStatus()}
      </div>
      
      <div className="mx-auto p-4" style={{ width }}>
        <Chessboard
          id={`simul-board-${id}`}
          position={game.fen()}
          onSquareClick={onSquareClick}
          onPieceDragBegin={onPieceDragBegin}
          onPieceDrop={onPieceDrop}
          customSquareStyles={{
            ...moveSquares,
            ...optionSquares
          }}
          boardOrientation={orientation}
          areArrowsAllowed={true}
          showBoardNotation={true}
        />
      </div>
    </div>
  );
};

export default SimulBoard;

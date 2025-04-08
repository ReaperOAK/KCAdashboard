import React, { useState, useEffect } from 'react';
import { Chessboard } from 'react-chessboard';
import { Chess } from 'chess.js';
import './SimulBoard.css';

const SimulBoard = ({
  id,
  position = 'start',
  orientation = 'white',
  allowMoves = true,
  onMove = null,
  opponentName = 'Opponent',
  width = 300,
  isActive = false,
  onBoardSelect = null,
  result = null,
}) => {
  const [game, setGame] = useState(new Chess(position !== 'start' ? position : undefined));
  const [moveFrom, setMoveFrom] = useState('');
  const [optionSquares, setOptionSquares] = useState({});
  const [isChecked, setIsChecked] = useState(false);
  const [gameOver, setGameOver] = useState(result ? true : false);

  // Update board state when position prop changes
  useEffect(() => {
    if (position !== 'start' && position !== game.fen()) {
      setGame(new Chess(position));
    }
  }, [position, game]); // Add game to dependency array

  // Check for game over and checks
  useEffect(() => {
    setIsChecked(game.inCheck());
    
    if (game.isGameOver() && !gameOver) {
      setGameOver(true);
    }
  }, [game, gameOver]);

  // Get possible moves for a square
  function getMoveOptions(square) {
    const moves = game.moves({
      square,
      verbose: true
    });
    
    if (moves.length === 0) return;

    const newSquares = {};
    moves.forEach((move) => {
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
  }

  // Square click handler for making moves
  function onSquareClick(square) {
    if (!allowMoves || !isActive) return;
    
    // Handle piece selection and movement
    if (moveFrom) {
      const gameCopy = new Chess(game.fen());
      const move = {
        from: moveFrom,
        to: square,
        promotion: 'q' // Always promote to queen for simplicity
      };

      try {
        gameCopy.move(move);
        setGame(gameCopy);
        setMoveFrom('');
        setOptionSquares({});
        
        if (onMove) {
          onMove(id, move, gameCopy.fen());
        }
      } catch (error) {
        setMoveFrom('');
        setOptionSquares({});
      }
    } else {
      const piece = game.get(square);
      if (piece && piece.color === game.turn()) {
        setMoveFrom(square);
        getMoveOptions(square);
      }
    }
  }

  // Calculate square styles
  const squareStyles = {
    ...optionSquares,
    ...(isChecked ? {
      [game.turn() === 'w' ? 
        game.board().flat().find(p => p && p.type === 'k' && p.color === 'w')?.square :
        game.board().flat().find(p => p && p.type === 'k' && p.color === 'b')?.square]: {
        backgroundColor: 'rgba(255, 0, 0, 0.5)'
      }
    } : {})
  };

  // Handle board click to select this board in the simul
  const handleBoardClick = () => {
    if (onBoardSelect) {
      onBoardSelect(id);
    }
  };

  // Format result for display
  const formatResult = (result) => {
    if (!result) return '';
    
    switch (result) {
      case '1-0': return 'White wins';
      case '0-1': return 'Black wins';
      case '1/2-1/2': return 'Draw';
      default: return result;
    }
  };

  return (
    <div 
      className={`simul-board ${isActive ? 'active' : ''} ${gameOver ? 'game-over' : ''}`}
      onClick={handleBoardClick}
    >
      <div className="simul-board-header">
        <div className="opponent-name">{opponentName}</div>
        {result && <div className="game-result">{formatResult(result)}</div>}
        {gameOver && !result && <div className="game-result">Game Over</div>}
      </div>
      
      <div className="simul-chessboard" style={{ width }}>
        <Chessboard
          id={`simul-board-${id}`}
          position={game.fen()}
          onSquareClick={onSquareClick}
          customSquareStyles={squareStyles}
          boardOrientation={orientation}
          arePiecesDraggable={false}
          boardWidth={width}
        />
      </div>
      
      <div className="simul-board-footer">
        <div className="moves-count">Moves: {Math.floor(game.history().length / 2) + (game.history().length % 2)}</div>
      </div>
    </div>
  );
};

export default SimulBoard;

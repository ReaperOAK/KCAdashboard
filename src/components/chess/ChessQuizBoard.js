import React, { useState, useEffect } from 'react';
import { Chessboard } from 'react-chessboard';
import { Chess } from 'chess.js';

const ChessQuizBoard = ({
  initialPosition = 'start',
  question = '',
  onMove = null,
  allowMoves = true,
  showAnswer = false,
  correctMoves = [],
  width = 400,
  orientation = 'white',
  disabled = false,
  className = ''
}) => {
  const [game, setGame] = useState(new Chess(initialPosition !== 'start' ? initialPosition : undefined));
  const [moveSquares, setMoveSquares] = useState({});
  const [lastMove, setLastMove] = useState(null);
  const [feedback, setFeedback] = useState('');
  const [feedbackType, setFeedbackType] = useState(''); // 'correct', 'incorrect', 'neutral'

  useEffect(() => {
    // Reset game when position changes
    const newGame = new Chess(initialPosition !== 'start' ? initialPosition : undefined);
    setGame(newGame);
    setMoveSquares({});
    setLastMove(null);
    setFeedback('');
    setFeedbackType('');
  }, [initialPosition]);

  const onDrop = (sourceSquare, targetSquare) => {
    if (!allowMoves || disabled) return false;

    const move = game.move({
      from: sourceSquare,
      to: targetSquare,
      promotion: 'q' // always promote to queen for simplicity
    });

    if (move === null) return false;

    const newGame = new Chess(game.fen());
    setGame(newGame);
    setLastMove({ from: sourceSquare, to: targetSquare });

    // Check if this move is correct
    const moveString = `${sourceSquare}${targetSquare}`;
    const isCorrectMove = correctMoves.some(correctMove => {
      if (typeof correctMove === 'string') {
        return correctMove === moveString;
      }
      return correctMove.from === sourceSquare && correctMove.to === targetSquare;
    });

    if (showAnswer) {
      if (isCorrectMove) {
        setFeedback('Correct move!');
        setFeedbackType('correct');
        setMoveSquares({
          [sourceSquare]: { backgroundColor: 'rgba(0, 255, 0, 0.4)' },
          [targetSquare]: { backgroundColor: 'rgba(0, 255, 0, 0.4)' }
        });
      } else {
        setFeedback('Not the best move. Try again!');
        setFeedbackType('incorrect');
        setMoveSquares({
          [sourceSquare]: { backgroundColor: 'rgba(255, 0, 0, 0.4)' },
          [targetSquare]: { backgroundColor: 'rgba(255, 0, 0, 0.4)' }
        });
      }
    }

    if (onMove) {
      onMove({
        from: sourceSquare,
        to: targetSquare,
        promotion: move.promotion,
        fen: newGame.fen(),
        isCorrect: isCorrectMove
      });
    }

    return true;
  };

  const customSquareStyles = {
    ...moveSquares,
    ...(lastMove && !showAnswer ? {
      [lastMove.from]: { backgroundColor: 'rgba(255, 255, 0, 0.4)' },
      [lastMove.to]: { backgroundColor: 'rgba(255, 255, 0, 0.4)' }
    } : {})
  };

  const resetPosition = () => {
    const newGame = new Chess(initialPosition !== 'start' ? initialPosition : undefined);
    setGame(newGame);
    setMoveSquares({});
    setLastMove(null);
    setFeedback('');
    setFeedbackType('');
  };

  return (
    <div className={`chess-quiz-board ${className}`}>
      {question && (
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-800">{question}</h3>
        </div>
      )}
      
      <div className="relative">
        <Chessboard
          position={game.fen()}
          onPieceDrop={onDrop}
          customSquareStyles={customSquareStyles}
          boardWidth={width}
          boardOrientation={orientation}
          areArrowsAllowed={false}
          arePiecesDraggable={allowMoves && !disabled}
        />
        
        {/* Loading overlay when disabled */}
        {disabled && (
          <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center">
            <div className="bg-white rounded-lg px-4 py-2 shadow-lg">
              <span className="text-gray-600">Position locked</span>
            </div>
          </div>
        )}
      </div>

      {/* Feedback message */}
      {feedback && (
        <div className={`mt-3 p-2 rounded-lg text-sm font-medium ${
          feedbackType === 'correct' ? 'bg-green-100 text-green-800' :
          feedbackType === 'incorrect' ? 'bg-red-100 text-red-800' :
          'bg-blue-100 text-blue-800'
        }`}>
          {feedback}
        </div>
      )}

      {/* Controls */}
      <div className="mt-3 flex gap-2">
        <button
          onClick={resetPosition}
          className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded text-sm"
          disabled={disabled}
        >
          Reset Position
        </button>
        
        {showAnswer && correctMoves.length > 0 && (
          <button
            onClick={() => {
              // Show the correct move
              const correctMove = correctMoves[0];
              const from = typeof correctMove === 'string' ? correctMove.slice(0, 2) : correctMove.from;
              const to = typeof correctMove === 'string' ? correctMove.slice(2, 4) : correctMove.to;
              
              setMoveSquares({
                [from]: { backgroundColor: 'rgba(0, 255, 0, 0.6)' },
                [to]: { backgroundColor: 'rgba(0, 255, 0, 0.6)' }
              });
              setFeedback('Correct move highlighted');
              setFeedbackType('correct');
            }}
            className="px-3 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded text-sm"
          >
            Show Answer
          </button>
        )}
      </div>
    </div>
  );
};

export default ChessQuizBoard;

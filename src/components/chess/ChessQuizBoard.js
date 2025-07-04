
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Chessboard } from 'react-chessboard';
import { Chess } from 'chess.js';

// Feedback message component
const FeedbackMessage = React.memo(({ feedback, feedbackType }) => {
  if (!feedback) return null;
  const colorClass = feedbackType === 'correct'
    ? 'bg-green-100 text-green-800'
    : feedbackType === 'incorrect'
    ? 'bg-red-100 text-red-800'
    : 'bg-blue-100 text-blue-800';
  return (
    <div className={`mt-3 p-2 rounded-lg text-sm font-medium ${colorClass}`} role="status">
      {feedback}
    </div>
  );
});

// Disabled overlay
const DisabledOverlay = React.memo(() => (
  <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center" aria-label="Position locked">
    <div className="bg-white rounded-lg px-4 py-2 shadow-lg">
      <span className="text-gray-dark">Position locked</span>
    </div>
  </div>
));

// Controls
const BoardControls = React.memo(({ onReset, onShowAnswer, showAnswer, correctMoves, disabled }) => (
  <div className="mt-3 flex gap-2">
    <button
      type="button"
      onClick={onReset}
      className="px-3 py-1 bg-gray-light hover:bg-accent hover:text-white text-primary rounded text-sm focus:outline-none focus:ring-2 focus:ring-accent"
      disabled={disabled}
      aria-label="Reset Position"
    >
      Reset Position
    </button>
    {showAnswer && correctMoves.length > 0 && (
      <button
        type="button"
        onClick={onShowAnswer}
        className="px-3 py-1 bg-accent text-white hover:bg-secondary rounded text-sm focus:outline-none focus:ring-2 focus:ring-accent"
        aria-label="Show Answer"
      >
        Show Answer
      </button>
    )}
  </div>
));

export const ChessQuizBoard = React.memo(({
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
  const [game, setGame] = useState(() => new Chess(initialPosition !== 'start' ? initialPosition : undefined));
  const [moveSquares, setMoveSquares] = useState({});
  const [lastMove, setLastMove] = useState(null);
  const [feedback, setFeedback] = useState('');
  const [feedbackType, setFeedbackType] = useState('');

  // Reset game when position changes
  useEffect(() => {
    const newGame = new Chess(initialPosition !== 'start' ? initialPosition : undefined);
    setGame(newGame);
    setMoveSquares({});
    setLastMove(null);
    setFeedback('');
    setFeedbackType('');
  }, [initialPosition]);

  // Memoize custom square styles
  const customSquareStyles = useMemo(() => ({
    ...moveSquares,
    ...(lastMove && !showAnswer ? {
      [lastMove.from]: { backgroundColor: 'rgba(255, 255, 0, 0.4)' },
      [lastMove.to]: { backgroundColor: 'rgba(255, 255, 0, 0.4)' }
    } : {})
  }), [moveSquares, lastMove, showAnswer]);

  // Handle piece drop
  const handleDrop = useCallback((sourceSquare, targetSquare) => {
    if (!allowMoves || disabled) return false;
    const move = game.move({
      from: sourceSquare,
      to: targetSquare,
      promotion: 'q'
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
  }, [allowMoves, disabled, game, correctMoves, showAnswer, onMove]);

  // Reset position handler
  const handleReset = useCallback(() => {
    const newGame = new Chess(initialPosition !== 'start' ? initialPosition : undefined);
    setGame(newGame);
    setMoveSquares({});
    setLastMove(null);
    setFeedback('');
    setFeedbackType('');
  }, [initialPosition]);

  // Show answer handler
  const handleShowAnswer = useCallback(() => {
    if (!correctMoves.length) return;
    const correctMove = correctMoves[0];
    const from = typeof correctMove === 'string' ? correctMove.slice(0, 2) : correctMove.from;
    const to = typeof correctMove === 'string' ? correctMove.slice(2, 4) : correctMove.to;
    setMoveSquares({
      [from]: { backgroundColor: 'rgba(0, 255, 0, 0.6)' },
      [to]: { backgroundColor: 'rgba(0, 255, 0, 0.6)' }
    });
    setFeedback('Correct move highlighted');
    setFeedbackType('correct');
  }, [correctMoves]);

  return (
    <div className={`chess-quiz-board ${className}`}>
      {question && (
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-primary">{question}</h3>
        </div>
      )}
      <div className="relative">
        <Chessboard
          position={game.fen()}
          onPieceDrop={handleDrop}
          onSquareClick={(square) => {
            if (!window._moveFromQuizBoard) {
              window._moveFromQuizBoard = square;
              return;
            }
            handleDrop(window._moveFromQuizBoard, square);
            window._moveFromQuizBoard = null;
          }}
          customSquareStyles={customSquareStyles}
          boardWidth={width}
          boardOrientation={orientation}
          areArrowsAllowed={false}
          arePiecesDraggable={allowMoves && !disabled}
        />
        {disabled && <DisabledOverlay />}
      </div>
      <FeedbackMessage feedback={feedback} feedbackType={feedbackType} />
      <BoardControls
        onReset={handleReset}
        onShowAnswer={handleShowAnswer}
        showAnswer={showAnswer}
        correctMoves={correctMoves}
        disabled={disabled}
      />
    </div>
  );
});

export default ChessQuizBoard;

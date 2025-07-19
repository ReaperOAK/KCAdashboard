
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Chessboard } from 'react-chessboard';
import { Chess } from 'chess.js';

// Color tokens from Tailwind config
const COLORS = {
  correctBg: 'bg-success',
  correctText: 'text-white',
  incorrectBg: 'bg-error',
  incorrectText: 'text-white',
  infoBg: 'bg-info',
  infoText: 'text-white',
  cardBg: 'bg-background-light dark:bg-background-dark',
  cardBorder: 'border border-gray-light shadow-md',
  button: {
    base: 'transition-all duration-200 px-3 py-1 rounded text-sm focus:outline-none focus:ring-2 focus:ring-accent',
    primary: 'bg-primary text-white hover:bg-secondary',
    accent: 'bg-accent text-white hover:bg-secondary',
    disabled: 'bg-gray-dark text-gray-light cursor-not-allowed',
    outline: 'border border-accent text-accent hover:bg-accent hover:text-white',
  },
};

// Feedback message component
const FeedbackMessage = React.memo(({ feedback, feedbackType }) => {
  if (!feedback) return null;
  let colorClass = '';
  if (feedbackType === 'correct') colorClass = `${COLORS.correctBg} ${COLORS.correctText}`;
  else if (feedbackType === 'incorrect') colorClass = `${COLORS.incorrectBg} ${COLORS.incorrectText}`;
  else colorClass = `${COLORS.infoBg} ${COLORS.infoText}`;
  return (
    <div className={`mt-4 p-2 rounded-lg text-sm font-semibold shadow ${colorClass} transition-all duration-200`} role="status">
      {feedback}
    </div>
  );
});

// Disabled overlay
const DisabledOverlay = React.memo(() => (
  <div className="absolute inset-0 bg-black/30 flex items-center justify-center z-10" aria-label="Position locked">
    <div className="bg-background-light dark:bg-background-dark rounded-lg px-4 py-2 shadow-lg border border-gray-light">
      <span className="text-gray-dark font-medium">Position locked</span>
    </div>
  </div>
));

// Controls
const BoardControls = React.memo(({ onReset, onShowAnswer, showAnswer, correctMoves, disabled }) => (
  <div className="mt-4 flex flex-wrap gap-2">
    <button
      type="button"
      onClick={onReset}
      className={`${COLORS.button.base} ${COLORS.button.outline} ${disabled ? COLORS.button.disabled : ''}`}
      disabled={disabled}
      aria-label="Reset Position"
      tabIndex={0}
    >
      Reset Position
    </button>
    {showAnswer && correctMoves.length > 0 && (
      <button
        type="button"
        onClick={onShowAnswer}
        className={`${COLORS.button.base} ${COLORS.button.accent}`}
        aria-label="Show Answer"
        tabIndex={0}
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
  const customSquareStyles = useMemo(() => {
    // Use Tailwind color tokens for highlights
    const lastMoveColor = 'rgba(118, 70, 235, 0.3)'; // accent
    return {
      ...moveSquares,
      ...(lastMove && !showAnswer ? {
        [lastMove.from]: { backgroundColor: lastMoveColor },
        [lastMove.to]: { backgroundColor: lastMoveColor }
      } : {})
    };
  }, [moveSquares, lastMove, showAnswer]);

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
          [sourceSquare]: { backgroundColor: 'rgba(67, 160, 71, 0.5)' },
          [targetSquare]: { backgroundColor: 'rgba(67, 160, 71, 0.5)' }
        });
      } else {
        setFeedback('Not the best move. Try again!');
        setFeedbackType('incorrect');
        setMoveSquares({
          [sourceSquare]: { backgroundColor: 'rgba(229, 57, 53, 0.5)' },
          [targetSquare]: { backgroundColor: 'rgba(229, 57, 53, 0.5)' }
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
      [from]: { backgroundColor: 'rgba(67, 160, 71, 0.7)' },
      [to]: { backgroundColor: 'rgba(67, 160, 71, 0.7)' }
    });
    setFeedback('Correct move highlighted');
    setFeedbackType('correct');
  }, [correctMoves]);

  // Responsive board width
  const getBoardWidth = () => {
    if (typeof window !== 'undefined') {
      if (window.innerWidth < 480) return 280;
      if (window.innerWidth < 768) return 340;
      if (window.innerWidth < 1024) return 380;
    }
    return width;
  };

  return (
    <div
      className={`chess-quiz-board ${COLORS.cardBg} ${COLORS.cardBorder} rounded-xl p-4 max-w-full mx-auto shadow-lg ${className}`}
      role="region"
      aria-label="Chess Quiz Board"
    >
      {question && (
        <div className="mb-4">
          <h3 className="text-xl font-semibold text-primary leading-tight">{question}</h3>
        </div>
      )}
      <div className="relative flex justify-center items-center">
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
          boardWidth={getBoardWidth()}
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

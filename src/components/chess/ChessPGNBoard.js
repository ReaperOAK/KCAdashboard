import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Chessboard } from 'react-chessboard';
import { Chess } from 'chess.js';
import { FaStepBackward, FaStepForward, FaQuestionCircle } from 'react-icons/fa';
import ChessEngine from '../../utils/ChessEngine';

// --- FeedbackMessage ---
const FeedbackMessage = React.memo(function FeedbackMessage({ feedback, feedbackType }) {
  if (!feedback) return null;
  let colorClass = '';
  if (feedbackType === 'correct') colorClass = 'bg-green-100 text-green-800';
  else if (feedbackType === 'incorrect') colorClass = 'bg-red-100 text-red-800';
  else colorClass = 'bg-accent/10 text-primary';
  return (
    <div className={`mt-3 p-2 rounded-lg text-sm font-medium ${colorClass}`} role="status" aria-live="polite">
      {feedback}
    </div>
  );
});

// --- DisabledOverlay ---
const DisabledOverlay = React.memo(function DisabledOverlay({ isWaiting, disabled }) {
  if (!isWaiting && !disabled) return null;
  return (
    <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center z-10" aria-label={isWaiting ? 'Computer is thinking' : 'Position locked'}>
      <div className="bg-white rounded-lg px-4 py-2 shadow-lg">
        <span className="text-gray-dark">{isWaiting ? 'Computer is thinking...' : 'Position locked'}</span>
      </div>
    </div>
  );
});

// --- BoardControls ---
const BoardControls = React.memo(function BoardControls({
  onStepBackward,
  onStepForward,
  onReset,
  onHint,
  moveIndex,
  totalMoves,
  canStepBackward,
  canStepForward,
  disabled
}) {
  return (
    <div className="mt-3 flex gap-2 items-center">
      <button
        type="button"
        onClick={onStepBackward}
        className="px-2 py-1 bg-gray-light hover:bg-gray-dark/20 text-primary rounded text-sm flex items-center focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        disabled={!canStepBackward}
        title="Previous move"
        aria-label="Previous move"
      >
        <FaStepBackward />
      </button>
      <button
        type="button"
        onClick={onStepForward}
        className="px-2 py-1 bg-gray-light hover:bg-gray-dark/20 text-primary rounded text-sm flex items-center focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        disabled={!canStepForward}
        title="Next move"
        aria-label="Next move"
      >
        <FaStepForward />
      </button>
      <span className="text-xs text-gray-dark ml-2">
        Move {moveIndex + 1} of {totalMoves}
      </span>
      <button
        type="button"
        onClick={onReset}
        className="ml-auto px-3 py-1 bg-background-light hover:bg-gray-light text-primary rounded text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        disabled={disabled}
        aria-label="Reset position"
      >
        Reset
      </button>
      <button
        type="button"
        onClick={onHint}
        className="px-3 py-1 bg-accent/10 hover:bg-accent/20 text-primary rounded text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        disabled={disabled || !canStepForward}
        aria-label="Show hint"
      >
        Hint
      </button>
    </div>
  );
});

export function ChessPGNBoard({
  pgn = '',
  expectedPlayerColor = 'white',
  orientation = 'white',
  onMove = null,
  question = '',
  disabled = false,
  className = '',
  width = 400,
  quizMode = false
}) {
  const [game, setGame] = useState(() => new Chess());
  const [gameHistory, setGameHistory] = useState([]);
  const [currentMoveIndex, setCurrentMoveIndex] = useState(-1);
  const [playerMoves, setPlayerMoves] = useState([]);
  const [feedback, setFeedback] = useState('');
  const [feedbackType, setFeedbackType] = useState('');
  const [isWaitingForEngine, setIsWaitingForEngine] = useState(false);
  const [engine] = useState(() => new ChessEngine(5));
  const [moveSquares, setMoveSquares] = useState({});

  // Memo: can step forward/backward
  const canStepBackward = useMemo(() => currentMoveIndex >= 0, [currentMoveIndex]);
  const canStepForward = useMemo(() => {
    if (currentMoveIndex >= gameHistory.length - 1) return false;
    if (!quizMode) return true;
    if (currentMoveIndex < gameHistory.length - 1) {
      const nextMove = gameHistory[currentMoveIndex + 1];
      const isPlayerMove = (expectedPlayerColor === 'white' && nextMove.color === 'w') ||
                           (expectedPlayerColor === 'black' && nextMove.color === 'b');
      return !isPlayerMove;
    }
    return false;
  }, [currentMoveIndex, gameHistory, quizMode, expectedPlayerColor]);

  // ...existing code...

  // Parse PGN and set up the game
  useEffect(() => {
    if (pgn) {
      try {
        const pgnGame = new Chess();
        pgnGame.loadPgn(pgn);
        // Get the move history
        const history = pgnGame.history({ verbose: true });
        setGameHistory(history);
        // Reset to starting position
        const newGame = new Chess();
        setGame(newGame);
        setCurrentMoveIndex(-1);
        setPlayerMoves([]);
        setFeedback('');
        setFeedbackType('');
      } catch (error) {
        setGameHistory([]);
        setFeedback('Invalid PGN format');
        setFeedbackType('incorrect');
      }
    } else {
      setGameHistory([]);
      setFeedback('');
      setFeedbackType('');
    }
  }, [pgn]);

  // Initialize engine
  useEffect(() => {
    const initEngine = async () => {
      try {
        await engine.initEngine();
      } catch (error) {
        console.error('Engine initialization failed:', error);
      }
    };
    
    initEngine();
    
    return () => {
      engine.terminate();
    };
  }, [engine]);

  // Check if it's the player's turn
  const isPlayerTurn = useCallback(() => {
    const currentTurn = game.turn();
    return (expectedPlayerColor === 'white' && currentTurn === 'w') ||
           (expectedPlayerColor === 'black' && currentTurn === 'b');
  }, [game, expectedPlayerColor]);

  // Make engine move
  const makeEngineMove = useCallback(async () => {
    if (!isPlayerTurn() && currentMoveIndex + 1 < gameHistory.length) {
      // Use the move from the PGN
      const nextMove = gameHistory[currentMoveIndex + 1];
      
      try {
        const newGame = new Chess(game.fen());
        newGame.move(nextMove.san);
        setGame(newGame);
        setCurrentMoveIndex(currentMoveIndex + 1);
        
        setFeedback(`Computer played: ${nextMove.san}`);
        setFeedbackType('neutral');
        
        // Clear move highlighting after a delay
        setTimeout(() => {
          setMoveSquares({});
        }, 1000);
        
      } catch (error) {
        console.error('Error making engine move:', error);
      }
    }
  }, [game, currentMoveIndex, gameHistory, isPlayerTurn]);

  // Handle player move
  const handleDrop = useCallback((sourceSquare, targetSquare) => {
    if (!isPlayerTurn() || disabled || isWaitingForEngine) {
      return false;
    }
    try {
      const move = game.move({
        from: sourceSquare,
        to: targetSquare,
        promotion: 'q'
      });
      if (move === null) {
        return false;
      }
      const newGame = new Chess(game.fen());
      setGame(newGame);
      if (currentMoveIndex + 1 < gameHistory.length) {
        const expectedMove = gameHistory[currentMoveIndex + 1];
        if (move.san === expectedMove.san) {
          setCurrentMoveIndex(currentMoveIndex + 1);
          setPlayerMoves([...playerMoves, move]);
          setFeedback(`Correct! You played: ${move.san}`);
          setFeedbackType('correct');
          setMoveSquares({
            [sourceSquare]: { backgroundColor: 'rgba(0, 255, 0, 0.4)' },
            [targetSquare]: { backgroundColor: 'rgba(0, 255, 0, 0.4)' }
          });
          if (onMove) {
            onMove({
              from: sourceSquare,
              to: targetSquare,
              san: move.san,
              isCorrect: true,
              fen: newGame.fen(),
              moveNumber: currentMoveIndex + 1
            });
          }
          setTimeout(() => {
            setIsWaitingForEngine(true);
            makeEngineMove();
            setIsWaitingForEngine(false);
          }, 1000);
        } else {
          setFeedback(`Incorrect. Expected: ${expectedMove.san}, but you played: ${move.san}`);
          setFeedbackType('incorrect');
          setMoveSquares({
            [sourceSquare]: { backgroundColor: 'rgba(255, 0, 0, 0.4)' },
            [targetSquare]: { backgroundColor: 'rgba(255, 0, 0, 0.4)' }
          });
          setTimeout(() => {
            const previousGame = new Chess();
            for (let i = 0; i <= currentMoveIndex; i++) {
              if (i < gameHistory.length) {
                previousGame.move(gameHistory[i].san);
              }
            }
            setGame(previousGame);
            setMoveSquares({});
          }, 1500);
        }
      } else {
        setFeedback('Sequence completed!');
        setFeedbackType('correct');
        if (onMove) {
          onMove({
            from: sourceSquare,
            to: targetSquare,
            san: move.san,
            isCorrect: true,
            fen: newGame.fen(),
            completed: true
          });
        }
      }
      return true;
    } catch (error) {
      console.error('Move error:', error);
      return false;
    }
  }, [game, gameHistory, currentMoveIndex, playerMoves, isPlayerTurn, disabled, isWaitingForEngine, onMove, makeEngineMove]);


  // Reset the position to start
  const handleReset = useCallback(() => {
    const newGame = new Chess();
    setGame(newGame);
    setCurrentMoveIndex(-1);
    setPlayerMoves([]);
    setFeedback('');
    setFeedbackType('');
    setMoveSquares({});
  }, []);

  // Show hint (next expected move)
  const handleHint = useCallback(() => {
    if (currentMoveIndex + 1 < gameHistory.length) {
      const nextMove = gameHistory[currentMoveIndex + 1];
      const expectedPlayerMove = (expectedPlayerColor === 'white' && nextMove.color === 'w') ||
                                (expectedPlayerColor === 'black' && nextMove.color === 'b');
      if (expectedPlayerMove) {
        setFeedback(`Hint: Try ${nextMove.san}`);
        setFeedbackType('neutral');
      }
    }
  }, [currentMoveIndex, gameHistory, expectedPlayerColor]);

  // Step-through controls
  const handleStepTo = useCallback((moveIdx) => {
    if (!gameHistory.length) return;
    const newGame = new Chess();
    for (let i = 0; i <= moveIdx; i++) {
      if (i < gameHistory.length) {
        newGame.move(gameHistory[i].san);
      }
    }
    setGame(newGame);
    setCurrentMoveIndex(moveIdx);
    setFeedback('');
    setFeedbackType('');
  }, [gameHistory]);

  const handleStepBackward = useCallback(() => {
    if (currentMoveIndex >= 0) {
      handleStepTo(currentMoveIndex - 1);
    }
  }, [currentMoveIndex, handleStepTo]);

  const handleStepForward = useCallback(() => {
    if (!canStepForward) return;
    handleStepTo(currentMoveIndex + 1);
  }, [canStepForward, currentMoveIndex, handleStepTo]);

  return (
    <section className={`chess-pgn-board ${className}`.trim()} aria-label="Chess PGN Board">
      <header className="flex items-center gap-2 mb-2">
        <span className="font-semibold text-sm">PGN Visualizer</span>
        <FaQuestionCircle className="text-accent ml-1" aria-label="Help" title="Paste a PGN game. Use the arrows to step through the moves. Errors will be shown below if the PGN is invalid." />
      </header>
      {question && (
        <div className="mb-2">
          <h3 className="text-base font-semibold text-primary">{question}</h3>
          <p className="text-xs text-gray-dark mt-1">
            Play as {expectedPlayerColor}. Follow the game line by making the correct moves.
          </p>
        </div>
      )}
      <div className="relative flex justify-center">
        <Chessboard
          position={game.fen()}
          onPieceDrop={handleDrop}
          onSquareClick={(square) => {
            // Emulate drag-and-drop logic for click-to-move
            if (!window._moveFromPGNBoard) {
              window._moveFromPGNBoard = square;
              return;
            }
            handleDrop(window._moveFromPGNBoard, square);
            window._moveFromPGNBoard = null;
          }}
          customSquareStyles={moveSquares}
          boardWidth={width}
          boardOrientation={orientation}
          areArrowsAllowed={false}
          arePiecesDraggable={!disabled && !isWaitingForEngine}
          aria-label="Chessboard PGN"
        />
        <DisabledOverlay isWaiting={isWaitingForEngine} disabled={disabled} />
      </div>
      <FeedbackMessage feedback={feedback} feedbackType={feedbackType} />
      <BoardControls
        onStepBackward={handleStepBackward}
        onStepForward={handleStepForward}
        onReset={handleReset}
        onHint={handleHint}
        moveIndex={currentMoveIndex}
        totalMoves={gameHistory.length}
        canStepBackward={canStepBackward}
        canStepForward={canStepForward}
        disabled={disabled}
      />
    </section>
  );
}

export default React.memo(ChessPGNBoard);

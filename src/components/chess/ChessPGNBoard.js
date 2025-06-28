import React, { useState, useEffect, useCallback } from 'react';
import { Chessboard } from 'react-chessboard';
import { Chess } from 'chess.js';
import { FaStepBackward, FaStepForward, FaQuestionCircle } from 'react-icons/fa';
import ChessEngine from '../../utils/ChessEngine';

const ChessPGNBoard = ({
  pgn = '',
  expectedPlayerColor = 'white',
  orientation = 'white',
  onMove = null,
  question = '',
  disabled = false,
  className = '',
  width = 400,
  quizMode = false // If true, restrict stepForward to only allow after student move
}) => {
  const [game, setGame] = useState(new Chess());
  const [gameHistory, setGameHistory] = useState([]);
  const [currentMoveIndex, setCurrentMoveIndex] = useState(-1);
  const [playerMoves, setPlayerMoves] = useState([]);
  const [feedback, setFeedback] = useState('');
  const [feedbackType, setFeedbackType] = useState('');
  const [isWaitingForEngine, setIsWaitingForEngine] = useState(false);
  const [engine] = useState(() => new ChessEngine(5)); // Medium difficulty
  const [moveSquares, setMoveSquares] = useState({});

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
  const onDrop = useCallback((sourceSquare, targetSquare) => {
    if (!isPlayerTurn() || disabled || isWaitingForEngine) {
      return false;
    }

    try {
      const move = game.move({
        from: sourceSquare,
        to: targetSquare,
        promotion: 'q' // Always promote to queen for simplicity
      });

      if (move === null) {
        return false;
      }

      const newGame = new Chess(game.fen());
      setGame(newGame);

      // Check if this matches the expected move from PGN
      if (currentMoveIndex + 1 < gameHistory.length) {
        const expectedMove = gameHistory[currentMoveIndex + 1];
        
        if (move.san === expectedMove.san) {
          setCurrentMoveIndex(currentMoveIndex + 1);
          setPlayerMoves([...playerMoves, move]);
          setFeedback(`Correct! You played: ${move.san}`);
          setFeedbackType('correct');
          
          // Highlight the move
          setMoveSquares({
            [sourceSquare]: { backgroundColor: 'rgba(0, 255, 0, 0.4)' },
            [targetSquare]: { backgroundColor: 'rgba(0, 255, 0, 0.4)' }
          });
          
          // Call onMove callback
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
          
          // Wait a moment, then make engine move
          setTimeout(() => {
            setIsWaitingForEngine(true);
            makeEngineMove();
            setIsWaitingForEngine(false);
          }, 1000);
          
        } else {
          setFeedback(`Incorrect. Expected: ${expectedMove.san}, but you played: ${move.san}`);
          setFeedbackType('incorrect');
          
          // Highlight incorrect move
          setMoveSquares({
            [sourceSquare]: { backgroundColor: 'rgba(255, 0, 0, 0.4)' },
            [targetSquare]: { backgroundColor: 'rgba(255, 0, 0, 0.4)' }
          });
          
          // Undo the incorrect move
          setTimeout(() => {
            const previousGame = new Chess();
            // Replay moves up to current position
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
        // No more moves in PGN
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
  const resetPosition = () => {
    const newGame = new Chess();
    setGame(newGame);
    setCurrentMoveIndex(-1);
    setPlayerMoves([]);
    setFeedback('');
    setFeedbackType('');
    setMoveSquares({});
  };

  // Show hint (next expected move)
  const showHint = () => {
    if (currentMoveIndex + 1 < gameHistory.length) {
      const nextMove = gameHistory[currentMoveIndex + 1];
      const expectedPlayerMove = (expectedPlayerColor === 'white' && nextMove.color === 'w') ||
                                (expectedPlayerColor === 'black' && nextMove.color === 'b');
      
      if (expectedPlayerMove) {
        setFeedback(`Hint: Try ${nextMove.san}`);
        setFeedbackType('neutral');
      }
    }
  };

  // --- Step-through controls for preview ---
  const stepTo = (moveIdx) => {
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
  };

  const stepBackward = () => {
    if (currentMoveIndex >= 0) {
      stepTo(currentMoveIndex - 1);
    }
  };
  const stepForward = () => {
    if (currentMoveIndex >= gameHistory.length - 1) return;

    // In quiz mode, block stepping forward if it's the student's turn and they haven't played the move
    if (quizMode) {
      const nextMove = gameHistory[currentMoveIndex + 1];
      const isPlayerMove = (expectedPlayerColor === 'white' && nextMove.color === 'w') ||
                           (expectedPlayerColor === 'black' && nextMove.color === 'b');
      if (isPlayerMove) {
        // Block step forward if it's the student's move
        setFeedback('You must play the correct move to proceed.');
        setFeedbackType('incorrect');
        return;
      }
    }
    stepTo(currentMoveIndex + 1);
  };

  return (
    <div className={`chess-pgn-board ${className}`}>
      <div className="flex items-center gap-2 mb-2">
        <span className="font-semibold text-sm">PGN Visualizer</span>
        <FaQuestionCircle className="text-blue-400 ml-1" title="Paste a PGN game. Use the arrows to step through the moves. Errors will be shown below if the PGN is invalid." />
      </div>
      {question && (
        <div className="mb-2">
          <h3 className="text-base font-semibold text-gray-800">{question}</h3>
          <p className="text-xs text-gray-600 mt-1">
            Play as {expectedPlayerColor}. Follow the game line by making the correct moves.
          </p>
        </div>
      )}
      <div className="relative">
        <Chessboard
          position={game.fen()}
          onPieceDrop={onDrop}
          customSquareStyles={moveSquares}
          boardWidth={width}
          boardOrientation={orientation}
          areArrowsAllowed={false}
          arePiecesDraggable={!disabled && !isWaitingForEngine}
        />
        {isWaitingForEngine && (
          <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center">
            <div className="bg-white rounded-lg px-4 py-2 shadow-lg">
              <span className="text-gray-600">Computer is thinking...</span>
            </div>
          </div>
        )}
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
      {/* Step-through controls */}
      <div className="mt-3 flex gap-2 items-center">
        <button
          onClick={stepBackward}
          className="px-2 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded text-sm flex items-center"
          disabled={currentMoveIndex < 0}
          title="Previous move"
        >
          <FaStepBackward />
        </button>
        <button
          onClick={stepForward}
          className="px-2 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded text-sm flex items-center"
          disabled={currentMoveIndex >= gameHistory.length - 1 || (quizMode && (() => {
            if (currentMoveIndex < gameHistory.length - 1) {
              const nextMove = gameHistory[currentMoveIndex + 1];
              const isPlayerMove = (expectedPlayerColor === 'white' && nextMove.color === 'w') ||
                                   (expectedPlayerColor === 'black' && nextMove.color === 'b');
              return isPlayerMove;
            }
            return false;
          })())}
          title="Next move"
        >
          <FaStepForward />
        </button>
        <span className="text-xs text-gray-500 ml-2">
          Move {currentMoveIndex + 1} of {gameHistory.length}
        </span>
        <button
          onClick={resetPosition}
          className="ml-auto px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded text-sm"
          disabled={disabled}
        >
          Reset
        </button>
        <button
          onClick={showHint}
          className="px-3 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded text-sm"
          disabled={disabled || currentMoveIndex + 1 >= gameHistory.length}
        >
          Hint
        </button>
      </div>
    </div>
  );
};

export default ChessPGNBoard;

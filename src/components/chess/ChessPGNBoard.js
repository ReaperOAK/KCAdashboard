import React, { useState, useEffect, useCallback } from 'react';
import { Chessboard } from 'react-chessboard';
import { Chess } from 'chess.js';
import ChessEngine from '../../utils/ChessEngine';

const ChessPGNBoard = ({
  pgn = '',
  expectedPlayerColor = 'white',
  orientation = 'white',
  onMove = null,
  question = '',
  disabled = false,
  className = '',
  width = 400
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
        console.error('Error loading PGN:', error);
        setFeedback('Invalid PGN format');
        setFeedbackType('incorrect');
      }
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

  return (
    <div className={`chess-pgn-board ${className}`}>
      {question && (
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-800">{question}</h3>
          <p className="text-sm text-gray-600 mt-1">
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
        
        {/* Loading overlay when waiting for engine */}
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

      {/* Controls */}
      <div className="mt-3 flex gap-2">
        <button
          onClick={resetPosition}
          className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded text-sm"
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
        
        <div className="text-xs text-gray-500 self-center ml-auto">
          Move {currentMoveIndex + 1} of {gameHistory.length}
        </div>
      </div>
    </div>
  );
};

export default ChessPGNBoard;

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Chessboard } from 'react-chessboard';
import { Chess } from 'chess.js';
import MoveHistory from './MoveHistory';
import EngineAnalysis from './EngineAnalysis';
import ChessEngineFactory from '../../utils/ChessEngineFactory';


const ChessBoard = ({
  position = 'start',
  orientation = 'white',
  allowMoves = true,
  showNotation = true,
  showHistory = true,
  showAnalysis = false,
  onMove = null,
  engineLevel = 10,
  playMode = 'analysis', // analysis, vs-ai, vs-human
  timeControl = null,
  customSquareStyles = {},
  width = 560,
  gameOverState = null,
  useOnlineAPI = false, // New prop for using Stockfish online API
}) => {
  const [game, setGame] = useState(new Chess(position !== 'start' ? position : undefined));
  const [fen, setFen] = useState(game.fen());
  const [moveFrom, setMoveFrom] = useState('');
  const [rightClickedSquares, setRightClickedSquares] = useState({});
  const [optionSquares, setOptionSquares] = useState({});
  const [history, setHistory] = useState([]);
  const [currentMove, setCurrentMove] = useState(-1);
  const [orientation_, setOrientation] = useState(orientation);
  const [engineEvaluation, setEngineEvaluation] = useState(null);
  const [isChecked, setIsChecked] = useState(false);
  const [gameOver, setGameOver] = useState({
    isOver: false,
    result: '',
    reason: ''
  });
  const [isThinking, setIsThinking] = useState(false);
  const [engineLoadError, setEngineLoadError] = useState(false);
  
  const engineRef = useRef(null);
  const engineMoveTimeoutRef = useRef(null);
  
  // Analyze the current position
  const analyzeCurrentPosition = useCallback(async () => {
    if (!engineRef.current || isThinking) return;
    
    try {
      setIsThinking(true);
      const analysis = await engineRef.current.evaluatePosition(game.fen(), 15);
      setEngineEvaluation(analysis);
    } catch (error) {
      console.error('Analysis error:', error);
    } finally {
      setIsThinking(false);
    }
  }, [game, isThinking]);

  // Helper function to make a fallback random legal move - regular function, not a hook
  const makeFallbackMove = useCallback((legalMoves, fen) => {
    if (legalMoves.length > 0) {
      const randomMove = legalMoves[Math.floor(Math.random() * legalMoves.length)];
      console.log('Used fallback random move:', randomMove);
      
      const fallbackGameCopy = new Chess(fen);
      fallbackGameCopy.move(randomMove);
      setGame(fallbackGameCopy);
      
      if (onMove) {
        onMove({
          from: randomMove.from,
          to: randomMove.to,
          promotion: randomMove.promotion
        }, fallbackGameCopy.fen());
      }
    }
  }, [onMove]);

  // Make the AI move
  const makeEngineMove = useCallback(async () => {
    if (!engineRef.current || isThinking || gameOver.isOver) return;
    
    try {
      setIsThinking(true);
      
      // Add a small delay to make it feel more natural
      engineMoveTimeoutRef.current = setTimeout(async () => {
        try {
          // Get the current FEN position - ESLint reported this as undefined
          const currentFen = game.fen();
          const bestMove = await engineRef.current.getBestMove(currentFen, 1000);
          
          if (bestMove && bestMove.length >= 4) {
            const from = bestMove.substring(0, 2);
            const to = bestMove.substring(2, 4);
            const promotion = bestMove.length > 4 ? bestMove.substring(4, 5) : undefined;
            
            // Try to make the move with validation
            try {
              // Make the move
              const aiGameCopy = new Chess(currentFen);
              const moveResult = aiGameCopy.move({ from, to, promotion });
              
              if (moveResult) {
                setGame(aiGameCopy);
                
                if (onMove) {
                  onMove({ from, to, promotion }, aiGameCopy.fen());
                }
              } else {
                console.warn('Invalid move received but not caught by chess.js:', bestMove);
                // Get legal moves for fallback
                const legalMoves = game.moves({ verbose: true });
                makeFallbackMove(legalMoves, currentFen);
              }
            } catch (moveError) {
              console.error('Engine move error:', moveError, 'for move:', bestMove);
              // Get legal moves for fallback
              const legalMoves = game.moves({ verbose: true });
              makeFallbackMove(legalMoves, currentFen);
            }
          } else {
            // If we get an invalid format, use fallback
            const legalMoves = game.moves({ verbose: true });
            makeFallbackMove(legalMoves, currentFen);
          }
        } catch (error) {
          console.error('Engine move processing error:', error);
          
          // Get legal moves and use fallback
          const legalMoves = game.moves({ verbose: true });
          // eslint-disable-next-line no-undef
          makeFallbackMove(legalMoves, currentFen);
        } finally {
          setIsThinking(false);
        }
      }, 500);
    } catch (error) {
      console.error('AI move error:', error);
      setIsThinking(false);
    }
  }, [game, isThinking, gameOver.isOver, onMove, makeFallbackMove]);

  // Initialize Chess Engine
  useEffect(() => {
    // Initialize engine once
    if ((showAnalysis || playMode === 'vs-ai') && !engineRef.current) {
      try {
        // Use factory to create appropriate engine
        engineRef.current = ChessEngineFactory.createEngine({
          useOnlineAPI,
          skillLevel: engineLevel
        });
      } catch (error) {
        console.error('Failed to initialize chess engine:', error);
        setEngineLoadError(true);
      }
    }

    return () => {
      if (engineRef.current) {
        engineRef.current.terminate();
        engineRef.current = null;
      }
      
      if (engineMoveTimeoutRef.current) {
        clearTimeout(engineMoveTimeoutRef.current);
      }
    };
  }, [engineLevel, playMode, showAnalysis, useOnlineAPI]); // Add useOnlineAPI dependency

  // Update engine level when it changes
  useEffect(() => {
    if (engineRef.current) {
      engineRef.current.setSkillLevel(engineLevel);
    }
  }, [engineLevel]);

  // Update FEN and analyze position
  useEffect(() => {
    setFen(game.fen());
    setIsChecked(game.inCheck());
    const currentTurn = game.turn();
    
    // Check for game over conditions
    if (game.isGameOver()) {
      const result = { isOver: true };
      
      if (game.isCheckmate()) {
        result.reason = 'checkmate';
        result.result = currentTurn === 'w' ? '0-1' : '1-0';
      } else if (game.isDraw()) {
        result.reason = game.isStalemate() ? 'stalemate' : 
                        game.isThreefoldRepetition() ? 'repetition' : 
                        game.isInsufficientMaterial() ? 'insufficient material' : 'fifty-move rule';
        result.result = '½-½';
      }
      
      setGameOver(result);
    } else {
      // Reset game over state if we're continuing a game (e.g. when stepping through history)
      if (gameOver.isOver) {
        setGameOver({ isOver: false, result: '', reason: '' });
      }
    }

    // Analyze position with engine if analysis is shown
    if (showAnalysis && engineRef.current && !isThinking) {
      analyzeCurrentPosition();
    }
    
    // If it's AI's turn in vs-ai mode, make the AI move
    if (playMode === 'vs-ai' && !gameOver.isOver && 
        ((orientation_.charAt(0) === 'w' && currentTurn === 'b') || 
         (orientation_.charAt(0) === 'b' && currentTurn === 'w'))) {
      makeEngineMove();
    }
  }, [game, showAnalysis, playMode, orientation_, gameOver.isOver, analyzeCurrentPosition, makeEngineMove, isThinking]);

  // Apply external game over state if provided
  useEffect(() => {
    if (gameOverState && gameOverState.isOver) {
      setGameOver(gameOverState);
    }
  }, [gameOverState]);

  // Record move history
  useEffect(() => {
    const moveHistory = [];
    const history = game.history({ verbose: true });
    
    for (let i = 0; i < history.length; i += 2) {
      const moveNumber = Math.floor(i / 2) + 1;
      const whiteMove = history[i];
      const blackMove = history[i + 1];
      
      moveHistory.push({
        moveNumber,
        white: whiteMove ? { from: whiteMove.from, to: whiteMove.to, san: whiteMove.san } : null,
        black: blackMove ? { from: blackMove.from, to: blackMove.to, san: blackMove.san } : null
      });
    }
    
    setHistory(moveHistory);
    setCurrentMove(history.length - 1);
  }, [game]);

  // Get possible moves for a square
  function getMoveOptions(square) {
    const moves = game.moves({
      square,
      verbose: true
    });
    
    if (moves.length === 0) {
      return;
    }

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

  function resetFirstMove() {
    setMoveFrom('');
    setOptionSquares({});
  }

  // Square click handler for making moves
  function onSquareClick(square) {
    if (!allowMoves || isThinking) return;
    
    // Check if it's the player's turn
    const playerColor = orientation_.charAt(0).toLowerCase();
    const currentTurn = game.turn();
    
    // In vs-ai or vs-human mode, only allow moving pieces when it's your turn
    if ((playMode === 'vs-ai' || playMode === 'vs-human') && playerColor !== currentTurn) {
      return;
    }
    
    // If we already have a piece selected
    if (moveFrom) {
      // Try to make a move
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
        
        // Call onMove callback if provided
        if (onMove) {
          onMove(move, gameCopy.fen());
        }
      } catch (error) {
        // Illegal move, reset selection
        resetFirstMove();
      }
    } else {
      // No piece was selected yet, try to select one
      const piece = game.get(square);
      if (piece && piece.color === game.turn()) {
        setMoveFrom(square);
        getMoveOptions(square);
      }
    }
  }

  // Right-click handler for square highlighting
  function onSquareRightClick(square) {
    const colour = "rgba(0, 0, 255, 0.4)";
    setRightClickedSquares({
      ...rightClickedSquares,
      [square]:
        rightClickedSquares[square] && rightClickedSquares[square].backgroundColor === colour
          ? undefined
          : { backgroundColor: colour }
    });
  }

  // Go to a specific move in the history
  const goToMove = useCallback((moveIndex) => {
    const gameCopy = new Chess();
    const moves = game.history({ verbose: true });
    
    for (let i = 0; i <= moveIndex && i < moves.length; i++) {
      gameCopy.move(moves[i]);
    }
    
    setGame(gameCopy);
    setCurrentMove(moveIndex);
  }, [game]);

  // Handle key navigation for moves
  const handleKeyDown = useCallback((e) => {
    if (!allowMoves) return;
    
    if (e.key === 'ArrowLeft') {
      const prevMove = Math.max(currentMove - 1, -1);
      goToMove(prevMove);
    } else if (e.key === 'ArrowRight') {
      const nextMove = Math.min(currentMove + 1, game.history().length - 1);
      goToMove(nextMove);
    }
  }, [allowMoves, currentMove, game, goToMove]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Flip board orientation
  function flipBoard() {
    setOrientation(orientation_ === 'white' ? 'black' : 'white');
  }

  // Reset the board to starting position
  function resetBoard() {
    setGame(new Chess());
    setMoveFrom('');
    setOptionSquares({});
    setRightClickedSquares({});
    setGameOver({
      isOver: false,
      result: '',
      reason: ''
    });
  }

  // Calculate square styles
  const squareStyles = {
    ...optionSquares,
    ...rightClickedSquares,
    ...customSquareStyles,
    ...(isChecked ? {
      [game.turn() === 'w' ? 
        game.board().flat().find(p => p && p.type === 'k' && p.color === 'w')?.square :
        game.board().flat().find(p => p && p.type === 'k' && p.color === 'b')?.square]: {
        backgroundColor: 'rgba(255, 0, 0, 0.5)'
      }
    } : {})
  };
  // Render the chess board with controls
  return (
    <div className="flex flex-col space-y-4">
      {engineLoadError && (
        <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
          <p className="text-yellow-800 mb-3">Using lightweight chess engine. Some advanced analysis features may be limited.</p>
          <div className="flex gap-2">
            <button 
              className="px-3 py-2 bg-yellow-600 text-white rounded text-sm hover:bg-yellow-700 transition-colors"
              onClick={() => window.open('/stockfish/test.html', '_blank')}
            >
              Run Engine Test
            </button>
          </div>
        </div>
      )}
      
      {useOnlineAPI && (
        <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg">
          <p className="text-blue-800">Using Stockfish Online API for analysis</p>
        </div>
      )}
      
      <div className="flex gap-6">
        <div className="relative" style={{ width }}>
          <Chessboard
            id="chess-board"
            position={fen}            onSquareClick={onSquareClick}
            onSquareRightClick={onSquareRightClick}
            customSquareStyles={squareStyles}
            boardOrientation={orientation_}
            arePiecesDraggable={allowMoves && !isThinking}
            showBoardNotation={showNotation}
          />
          {isThinking && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
              <div className="bg-white rounded-lg p-4 flex items-center gap-3">
                <div className="w-6 h-6 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-purple-900 font-medium">Thinking...</span>
              </div>
            </div>
          )}
        </div>
        
        <div className="flex flex-col gap-2">
          <button onClick={flipBoard} className="px-4 py-2 bg-purple-700 text-white rounded hover:bg-purple-800 transition-colors">
            Flip Board
          </button>
          <button onClick={resetBoard} className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed" disabled={isThinking}>
            Reset Board
          </button>
          
          {gameOver.isOver && (
            <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg">
              <div className="text-blue-900 font-semibold">Game Over: {gameOver.result}</div>
              <div className="text-blue-700 text-sm">Reason: {gameOver.reason}</div>
            </div>
          )}
        </div>
      </div>
      
      <div className="min-w-0 flex-1">
        {showHistory && <MoveHistory history={history} currentMove={currentMove} goToMove={goToMove} />}
        {showAnalysis && <EngineAnalysis engineEvaluation={engineEvaluation} />}
      </div>
    </div>
  );
};

export default ChessBoard;

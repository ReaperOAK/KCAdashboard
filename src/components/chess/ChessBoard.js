import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Chessboard } from 'react-chessboard';
import { Chess } from 'chess.js';
import MoveHistory from './MoveHistory';
import EngineAnalysis from './EngineAnalysis';
import DrawOfferDialog from './DrawOfferDialog';
import DrawOfferToast from './DrawOfferToast';
import ChessEngineFactory from '../../utils/ChessEngineFactory';
import { BrowserNotification } from '../../utils/BrowserNotification';
import { ChessApi } from '../../api/chess';

// --- Loading Spinner ---
const LoadingSpinner = React.memo(({ label }) => (
  <div className="flex items-center justify-center py-8 text-accent font-semibold" role="status" aria-live="polite">
    <svg className="animate-spin h-8 w-8 text-accent mr-3" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
    </svg>
    <span className="text-lg">{label}</span>
  </div>
));

// --- Game Over Banner ---
const GameOverBanner = React.memo(({ result, reason }) => (
  <div className="bg-success/10 border border-success p-4 rounded-xl mt-2 flex flex-col items-center" role="status" aria-live="polite">
    <div className="text-success font-semibold text-lg">Game Over: {result}</div>
    <div className="text-success text-sm">Reason: {reason}</div>
  </div>
));

// --- Engine Error Banner ---
const EngineErrorBanner = React.memo(() => (
  <div className="bg-warning/10 border border-warning p-4 rounded-xl mb-2">
    <p className="text-warning mb-3">Using lightweight chess engine. Some advanced analysis features may be limited.</p>
    <div className="flex gap-2">
      <button 
        className="px-4 py-2 bg-warning text-white rounded-lg text-sm hover:bg-warning/80 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        onClick={() => window.open('/stockfish/test.html', '_blank')}
        type="button"
      >
        Run Engine Test
      </button>
    </div>
  </div>
));

// --- Online API Banner ---
const OnlineAPIBanner = React.memo(() => (
  <div className="bg-info/10 border border-info p-3 rounded-xl mb-2">
    <p className="text-info">Using Stockfish Online API for analysis</p>
  </div>
));

// --- PGN Export Button ---
const PGNExportButton = React.memo(({ onExport }) => (
  <button
    onClick={onExport}
    className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-secondary transition-colors mt-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
    type="button"
    aria-label="Export PGN"
  >
    Export PGN
  </button>
));
const ChessBoard = ({
  position = 'start',
  orientation = 'white',
  allowMoves = true,
  showNotation = true,
  showHistory = false,
  showAnalysis = false,
  onMove = null,
  engineLevel = 10,
  playMode = 'analysis', // analysis, vs-ai, vs-human
  timeControl = null,
  customSquareStyles = {},
  width = 560,
  gameOverState = null,
  useOnlineAPI = false, // New prop for using Stockfish online API
  gameId = null, // New prop for resign
  onResign = null, // Optional callback after resign
  backendMoveHistory = null, // New prop for backend move history
  currentMoveIndex = null, // New prop for initial move index
}) => {
  const navigate = useNavigate();
  // Resign handler
  const [resignLoading, setResignLoading] = useState(false);
  const [showDrawDialog, setShowDrawDialog] = useState(false);
  const [pendingDrawOffers, setPendingDrawOffers] = useState([]);
  const [hasUnseenDrawOffer, setHasUnseenDrawOffer] = useState(false);
  const [showDrawToast, setShowDrawToast] = useState(false);
  const [currentDrawOffer, setCurrentDrawOffer] = useState(null);
  const [drawOffersSupported, setDrawOffersSupported] = useState(true); // Assume supported initially
  
  const handleResign = useCallback(async () => {
    if (!gameId) {
      alert('Game ID not found. Cannot resign.');
      return;
    }
    if (!window.confirm('Are you sure you want to resign this game?')) return;
    setResignLoading(true);
    try {
      await ChessApi.resignGame(gameId);
      setGameOver({ isOver: true, result: '0-1', reason: 'resigned' });
      try { await ChessApi.saveGameResult(gameId, '0-1'); } catch {}
      if (onResign) onResign();
      setTimeout(() => navigate('/chess/play'), 1200);
    } catch (e) {
      alert('Failed to resign: ' + (e.message || e));
    } finally {
      setResignLoading(false);
    }
  }, [gameId, navigate, onResign]);

  // Check for pending draw offers
  const checkDrawOffers = useCallback(async () => {
    if (!gameId || playMode !== 'vs-human') return;
    
    try {
      const response = await ChessApi.getDrawOffers(gameId);
      if (response.success) {
        const offers = response.offers || [];
        const incomingOffers = offers.filter(offer => offer.can_respond);
        
        // Check if there are new offers we haven't seen
        const hasNewOffers = incomingOffers.length > 0 && 
          (pendingDrawOffers.length === 0 || 
           incomingOffers.some(offer => 
             !pendingDrawOffers.find(prev => prev.id === offer.id)
           ));

        setPendingDrawOffers(offers);
        
        if (hasNewOffers && !showDrawDialog && !showDrawToast) {
          setHasUnseenDrawOffer(true);
          // Show toast notification for the first incoming offer
          const latestOffer = incomingOffers[0];
          if (latestOffer) {
            setCurrentDrawOffer(latestOffer);
            setShowDrawToast(true);
            
            // Show browser notification if tab is not active
            BrowserNotification.showDrawOfferNotification(latestOffer.offerer_name, gameId);
          }
        }
      }
    } catch (error) {
      // Only log error if it's not a 404 (endpoint doesn't exist yet)
      if (!error.message?.includes('404') && !error.message?.includes('not found')) {
        console.error('Error checking draw offers:', error);
      } else {
        // Mark draw offers as not supported if we get 404s
        setDrawOffersSupported(false);
      }
      // Silently fail for missing endpoints during development/deployment
    }
  }, [gameId, playMode, pendingDrawOffers, showDrawDialog, showDrawToast]);

  // Handle toast actions
  const handleToastAccept = useCallback(async () => {
    if (!currentDrawOffer || !gameId) return;
    
    try {
      const response = await ChessApi.respondToDraw(gameId, 'accept');
      if (response.success && response.game_ended) {
        setGameOver({ isOver: true, result: '1/2-1/2', reason: 'mutual agreement' });
        BrowserNotification.showGameEndNotification('1/2-1/2', 'mutual agreement');
        setTimeout(() => navigate('/chess/play'), 1200);
      }
      setShowDrawToast(false);
      setCurrentDrawOffer(null);
      checkDrawOffers(); // Refresh offers
    } catch (error) {
      if (!error.message?.includes('404')) {
        console.error('Error accepting draw from toast:', error);
      }
      // Fallback: just close the toast if endpoint doesn't exist
      setShowDrawToast(false);
      setCurrentDrawOffer(null);
    }
  }, [currentDrawOffer, gameId, navigate, checkDrawOffers]);

  const handleToastDecline = useCallback(async () => {
    if (!currentDrawOffer || !gameId) return;
    
    try {
      await ChessApi.respondToDraw(gameId, 'decline');
      setShowDrawToast(false);
      setCurrentDrawOffer(null);
      checkDrawOffers(); // Refresh offers
    } catch (error) {
      if (!error.message?.includes('404')) {
        console.error('Error declining draw from toast:', error);
      }
      // Fallback: just close the toast if endpoint doesn't exist
      setShowDrawToast(false);
      setCurrentDrawOffer(null);
    }
  }, [currentDrawOffer, gameId, checkDrawOffers]);

  const handleToastView = useCallback(() => {
    setShowDrawDialog(true);
    setShowDrawToast(false);
    setHasUnseenDrawOffer(false);
  }, []);

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
    if (game.isGameOver() && !gameOver.isOver) {
      const result = { isOver: true };
      let saveResult = null;
      if (game.isCheckmate()) {
        result.reason = 'checkmate';
        // If it's white's turn and checkmate, black won (0-1), else white won (1-0)
        result.result = currentTurn === 'w' ? '0-1' : '1-0';
        saveResult = result.result;
      } else if (game.isDraw()) {
        result.reason = game.isStalemate() ? 'stalemate' : 
                        game.isThreefoldRepetition() ? 'repetition' : 
                        game.isInsufficientMaterial() ? 'insufficient material' : 'fifty-move rule';
        result.result = '1/2-1/2';
        saveResult = '1/2-1/2';
      }
      setGameOver(result);
      // Save result to backend for stats if in vs-human mode
      if (playMode === 'vs-human' && gameId && saveResult) {
        ChessApi.saveGameResult(gameId, saveResult).finally(() => {
          setTimeout(() => navigate('/chess/play'), 1200);
        });
      }
      
      // Show browser notification for game end
      if (playMode === 'vs-human') {
        BrowserNotification.showGameEndNotification(result.result, result.reason);
      }
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
  }, [game, showAnalysis, playMode, orientation_, gameOver.isOver, analyzeCurrentPosition, makeEngineMove, isThinking, gameId, navigate]);

  // Apply external game over state if provided
  useEffect(() => {
    if (gameOverState && gameOverState.isOver) {
      setGameOver(gameOverState);
    }
  }, [gameOverState]);

  // Update move history from backend or local
  useEffect(() => {
    if (backendMoveHistory && Array.isArray(backendMoveHistory)) {
      // Convert backend move list to table format for MoveHistory, include created_at
      const moveHistory = [];
      for (let i = 0; i < backendMoveHistory.length; i += 2) {
        const moveNumber = Math.floor(i / 2) + 1;
        const whiteMove = backendMoveHistory[i];
        const blackMove = backendMoveHistory[i + 1];
        moveHistory.push({
          moveNumber,
          white: whiteMove ? { san: whiteMove.move_san, created_at: whiteMove.created_at } : null,
          black: blackMove ? { san: blackMove.move_san, created_at: blackMove.created_at } : null
        });
      }
      setHistory(moveHistory);
      setCurrentMove(currentMoveIndex != null ? currentMoveIndex : (backendMoveHistory.length - 1));
    } else {
      // Fallback to local chess.js history
      const moveHistory = [];
      const localHistory = game.history({ verbose: true });
      for (let i = 0; i < localHistory.length; i += 2) {
        const moveNumber = Math.floor(i / 2) + 1;
        const whiteMove = localHistory[i];
        const blackMove = localHistory[i + 1];
        moveHistory.push({
          moveNumber,
          white: whiteMove ? { from: whiteMove.from, to: whiteMove.to, san: whiteMove.san } : null,
          black: blackMove ? { from: blackMove.from, to: blackMove.to, san: blackMove.san } : null
        });
      }
      setHistory(moveHistory);
      setCurrentMove(localHistory.length - 1);
    }
  }, [backendMoveHistory, currentMoveIndex, game]);

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
    const playerColor = orientation_.charAt(0).toLowerCase();
    const currentTurn = game.turn();
    if ((playMode === 'vs-ai' || playMode === 'vs-human') && playerColor !== currentTurn) {
      return;
    }
    if (moveFrom) {
      handleMove(moveFrom, square);
    } else {
      const piece = game.get(square);
      if (piece && piece.color === game.turn()) {
        setMoveFrom(square);
        getMoveOptions(square);
      }
    }
  }

  // Drag-and-drop handler for making moves
  function onPieceDrop(sourceSquare, targetSquare) {
    if (!allowMoves || isThinking) return false;
    const playerColor = orientation_.charAt(0).toLowerCase();
    const currentTurn = game.turn();
    if ((playMode === 'vs-ai' || playMode === 'vs-human') && playerColor !== currentTurn) {
      return false;
    }
    return handleMove(sourceSquare, targetSquare);
  }

  // Shared move logic for click and drag
  function handleMove(from, to) {
    const gameCopy = new Chess(game.fen());
    const move = {
      from,
      to,
      promotion: 'q' // Always promote to queen for simplicity
    };
    try {
      const result = gameCopy.move(move);
      if (result) {
        setGame(gameCopy);
        setMoveFrom('');
        setOptionSquares({});
        if (onMove) {
          onMove(move, gameCopy.fen());
        }
        return true;
      } else {
        resetFirstMove();
        return false;
      }
    } catch (error) {
      resetFirstMove();
      return false;
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

  // Poll for draw offers every 5 seconds in vs-human mode
  useEffect(() => {
    if (playMode === 'vs-human' && gameId) {
      checkDrawOffers(); // Initial check
      
      const pollInterval = setInterval(checkDrawOffers, 5000);
      return () => clearInterval(pollInterval);
    }
  }, [playMode, gameId, checkDrawOffers]);

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
  // Export PGN for the current game
  const exportPGN = useCallback(() => {
    try {
      const pgn = game.pgn();
      const blob = new Blob([pgn], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `chess-game-${Date.now()}.pgn`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      alert('Failed to export PGN.');
    }
  }, [game]);

  // Render the chess board with controls
  return (
    <div className="flex flex-col space-y-6 w-full max-w-full px-2 sm:px-4 md:px-8 py-4 md:py-6 bg-background-light dark:bg-background-dark rounded-2xl shadow-xl mx-auto">
      {engineLoadError && <EngineErrorBanner />}
      {engineLoadError && <PGNExportButton onExport={exportPGN} />}
      {useOnlineAPI && <OnlineAPIBanner />}
      <div className="flex flex-col md:flex-row gap-8 w-full items-stretch">
        <div className="relative w-full flex justify-center md:justify-start md:w-2/3 lg:w-3/4">
          <div className="w-full max-w-full sm:max-w-sm md:max-w-md lg:max-w-full aspect-square">
            <Chessboard
              id="chess-board"
              position={fen}
              onSquareClick={onSquareClick}
              onPieceDrop={onPieceDrop}
              onSquareRightClick={onSquareRightClick}
              customSquareStyles={squareStyles}
              boardOrientation={orientation_}
              arePiecesDraggable={allowMoves && !isThinking}
              showBoardNotation={showNotation}
            />
            {isThinking && <div className="absolute inset-0 flex items-center justify-center bg-background-light/80 dark:bg-background-dark/80 z-10"><LoadingSpinner label="Thinking..." /></div>}
          </div>
        </div>
        <div className="flex flex-col gap-4 w-full md:w-1/3 lg:w-1/2 justify-center md:justify-start">
          <button
            onClick={flipBoard}
            className="px-4 py-2 bg-primary text-white rounded-xl hover:bg-secondary transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent w-full"
            type="button"
          >
            Flip Board
          </button>
          <button
            onClick={resetBoard}
            className="px-4 py-2 bg-gray-dark text-gray-light rounded-xl hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-accent w-full"
            disabled={isThinking}
            type="button"
          >
            Reset Board
          </button>
          <button
            onClick={handleResign}
            className="px-4 py-2 bg-highlight text-white rounded-xl hover:bg-red-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-highlight w-full"
            disabled={isThinking || gameOver.isOver || resignLoading || !gameId}
            type="button"
          >
            {resignLoading ? 'Resigning...' : 'Resign'}
          </button>
          {/* Draw offer button - only show in vs-human mode with active game and if supported */}
          {playMode === 'vs-human' && gameId && !gameOver.isOver && drawOffersSupported && (
            <button
              onClick={() => {
                setShowDrawDialog(true);
                setHasUnseenDrawOffer(false); // Mark as seen when opening dialog
              }}
              className={`px-4 py-2 text-white rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 w-full relative ${
                hasUnseenDrawOffer 
                  ? 'bg-orange-600 hover:bg-orange-700 focus-visible:ring-orange-600 animate-pulse' 
                  : 'bg-blue-600 hover:bg-blue-700 focus-visible:ring-blue-600'
              }`}
              disabled={isThinking}
              type="button"
            >
              {hasUnseenDrawOffer ? (
                <>
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-2 h-2 bg-white rounded-full animate-ping"></span>
                    Draw Offer Received
                  </span>
                </>
              ) : (
                'Offer Draw'
              )}
              {pendingDrawOffers.filter(offer => offer.can_respond).length > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {pendingDrawOffers.filter(offer => offer.can_respond).length}
                </span>
              )}
            </button>
          )}
          {gameOver.isOver && <GameOverBanner result={gameOver.result} reason={gameOver.reason} />}
          <div className="min-w-0 flex-1 w-full mt-4">
        {showHistory && <MoveHistory history={history} currentMove={currentMove} goToMove={goToMove} />}
        {showAnalysis && <EngineAnalysis engineEvaluation={engineEvaluation} />}
      </div>
        </div>
      </div>
      
      {/* Draw Offer Dialog */}
      <DrawOfferDialog
        gameId={gameId}
        isVisible={showDrawDialog}
        onClose={() => setShowDrawDialog(false)}
        onGameEnd={(result, reason) => {
          setGameOver({ isOver: true, result, reason });
          setShowDrawDialog(false);
          if (playMode === 'vs-human' && gameId) {
            setTimeout(() => navigate('/chess/play'), 1200);
          }
        }}
      />

      {/* Draw Offer Toast Notification */}
      {showDrawToast && currentDrawOffer && (
        <DrawOfferToast
          offer={currentDrawOffer}
          onAccept={handleToastAccept}
          onDecline={handleToastDecline}
          onView={handleToastView}
          onClose={() => {
            setShowDrawToast(false);
            setCurrentDrawOffer(null);
          }}
        />
      )}
    </div>
  );
};

export default ChessBoard;

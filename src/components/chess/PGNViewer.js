import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Chess } from 'chess.js';
import { parse } from '@mliebelt/pgn-parser';
import { Chessboard } from 'react-chessboard';
import { 
  PlayIcon, 
  PauseIcon, 
  BackwardIcon, 
  ForwardIcon,
  ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon,
  ArrowUpTrayIcon,
  Cog6ToothIcon,
  SunIcon,
  MoonIcon
} from '@heroicons/react/24/outline';

/**
 * Comprehensive PGN Viewer Component
 * Features:
 * - Parse complex PGNs with multiple games
 * - Support variations, comments, and NAGs
 * - Navigation controls (play, pause, forward, backward, first, last)
 * - Game selection for multiple games
 * - Responsive design with dark/light theme
 * - Header information display
 * - Move list with current move highlighting
 */

/**
 * PGNViewer - Chess PGN viewer with board, move list, and controls.
 * @param {string} initialPgn
 * @param {number} width
 * @param {number} height
 * @param {boolean} autoPlay
 * @param {number} autoPlayDelay
 * @param {string} theme
 * @param {string} orientation
 * @param {boolean} showHeaders
 * @param {boolean} showMoveList
 * @param {boolean} showControls
 * @param {function} onGameChange
 * @param {function} onMoveChange
 * @param {string} className
 */
export const PGNViewer = React.memo(function PGNViewer({
  initialPgn = '',
  width = 400,
  height = 400,
  autoPlay = false,
  autoPlayDelay = 1000,
  theme = 'light',
  orientation = 'white',
  showHeaders = true,
  showMoveList = true,
  showControls = true,
  onGameChange = null,
  onMoveChange = null,
  className = '',
  allowMoves = true
}) {
  // Core game state
  const [games, setGames] = useState([]);
  const [currentGameIndex, setCurrentGameIndex] = useState(0);
  const [currentGame, setCurrentGame] = useState(new Chess());
  const [gameHistory, setGameHistory] = useState([]);
  const [currentMoveIndex, setCurrentMoveIndex] = useState(-1);
  const [position, setPosition] = useState(currentGame.fen());
  // Responsive board width based on window size
  const [responsiveBoardWidth, setResponsiveBoardWidth] = useState(width);
  useEffect(() => {
    function handleResize() {
      const w = typeof window !== 'undefined' ? window.innerWidth : width;
      setResponsiveBoardWidth(Math.min(width, w-50));
    }
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [width]);
  // UI state
  const [isPlaying, setIsPlaying] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [localTheme, setLocalTheme] = useState(theme);
  const [moveAnnotations, setMoveAnnotations] = useState({});
  const [gameHeaders, setGameHeaders] = useState({});
  const [variations, setVariations] = useState({});
  const [error, setError] = useState('');
  const autoPlayRef = useRef(null);

  /**
   * Parse PGN text and extract games with metadata
   */
  const parsePGN = useCallback((pgnText) => {
    try {
      setError('');
      
      if (!pgnText.trim()) {
        setGames([]);
        return;
      }

      // Use @mliebelt/pgn-parser for complex PGN parsing
      const parsedGames = parse(pgnText, { startRule: 'games' });
      
      // Safety check: limit to 50 games to prevent performance issues
      if (parsedGames && parsedGames.length > 50) {
        setError(`Too many games detected (${parsedGames.length}). Only displaying first 50 games for performance reasons.`);
        parsedGames.splice(50); // Keep only first 50 games
      }
      
      
      const processedGames = parsedGames.map((game, index) => {
        const chess = new Chess();
        const moveHistory = [];
        const annotations = {};
        const gameVariations = {};
        
        // Extract headers
        const headers = {};
        if (game.tags) {
          
          
          // Handle both array and object formats
          if (Array.isArray(game.tags)) {
            game.tags.forEach(tag => {
              if (tag && typeof tag === 'object' && tag.name && tag.value) {
                headers[tag.name] = tag.value;
              }
            });
          } else if (typeof game.tags === 'object' && game.tags !== null) {
            // Tags is already an object, copy it directly but handle Date objects
            Object.keys(game.tags).forEach(key => {
              const value = game.tags[key];
              if (value && typeof value === 'object' && value !== null) {
                // Handle complex objects from PGN parser
                if (value.value) {
                  headers[key] = String(value.value);
                } else if (value.year && value.month && value.day) {
                  // Handle date objects
                  headers[key] = `${value.year}.${String(value.month).padStart(2, '0')}.${String(value.day).padStart(2, '0')}`;
                } else {
                  // Fallback to JSON string for unknown objects
                  headers[key] = JSON.stringify(value);
                }
              } else {
                // Ensure all values are strings
                headers[key] = String(value || '');
              }
            });
          }
        }

        // Process moves with variations and comments
        const processMoves = (moves, parentPath = []) => {
          // Safety check: ensure moves is an array
          if (!Array.isArray(moves)) {
            console.warn('processMoves called with non-array moves:', typeof moves, moves);
            return;
          }
          
          moves.forEach((move, moveIndex) => {
            const fullPath = [...parentPath, moveIndex];
            
            if (move && move.notation && move.notation.notation) {
              try {
                const moveResult = chess.move(move.notation.notation);
                if (moveResult) {
                  const historyEntry = {
                    ...moveResult,
                    fen: chess.fen(),
                    moveNumber: Math.ceil((chess.history().length) / 2),
                    path: fullPath,
                    comments: Array.isArray(move.commentAfter) ? move.commentAfter : [],
                    nags: Array.isArray(move.nag) ? move.nag : [],
                    variations: Array.isArray(move.variations) ? move.variations : []
                  };
                  
                  moveHistory.push(historyEntry);
                  
                  // Store annotations with safe array handling
                  if (Array.isArray(move.commentAfter) && move.commentAfter.length > 0) {
                    const commentText = move.commentAfter
                      .filter(comment => typeof comment === 'string')
                      .join(' ');
                    if (commentText.trim()) {
                      annotations[moveHistory.length - 1] = commentText;
                    }
                  }
                  
                  // Process variations with safe handling
                  if (Array.isArray(move.variations) && move.variations.length > 0) {
                    gameVariations[moveHistory.length - 1] = move.variations
                      .filter(variation => variation && Array.isArray(variation.moves))
                      .map(variation => {
                        const varChess = new Chess(chess.fen());
                        const varMoves = [];
                        
                        variation.moves.forEach(varMove => {
                          if (varMove && varMove.notation && varMove.notation.notation) {
                            try {
                              const varMoveResult = varChess.move(varMove.notation.notation);
                              if (varMoveResult) {
                                varMoves.push({
                                  ...varMoveResult,
                                  fen: varChess.fen(),
                                  comments: Array.isArray(varMove.commentAfter) ? varMove.commentAfter : []
                                });
                              }
                            } catch (varErr) {
                              console.warn(`Error processing variation move ${varMove.notation.notation}:`, varErr);
                            }
                          }
                        });
                        
                        return {
                          moves: varMoves,
                          comment: (typeof variation.comment === 'string') ? variation.comment : ''
                        };
                      });
                  }
                }
              } catch (err) {
                console.warn(`Error processing move ${move.notation.notation}:`, err);
              }
            }
          });
        };

        if (game.moves && Array.isArray(game.moves) && game.moves.length > 0) {
          // Only process moves if we have actual move data
          const hasValidMoves = game.moves.some(move => 
            move && move.notation && move.notation.notation
          );
          
          if (hasValidMoves) {
            processMoves(game.moves);
          } else {
            
          }
        }

        return {
          id: index,
          headers,
          moveHistory,
          annotations,
          variations: gameVariations,
          originalPgn: game
        };
      });

      setGames(processedGames);
      
      if (processedGames.length > 0) {
        setCurrentGameIndex(0);
        loadGame(processedGames[0]);
      }
      
    } catch (err) {
      console.error('PGN parsing error:', err);
      setError(`Failed to parse PGN: ${err.message}`);
      setGames([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // loadGame will be defined after this

  /**
   * Load a specific game
   */
  const loadGame = useCallback((game) => {
    const chess = new Chess();
    setCurrentGame(chess);
    setGameHistory(game.moveHistory || []);
    setMoveAnnotations(game.annotations || {});
    setVariations(game.variations || {});
    setGameHeaders(game.headers || {});
    setCurrentMoveIndex(-1);
    setPosition(chess.fen());
    setIsPlaying(false);
    
    if (onGameChange) {
      onGameChange(game);
    }
  }, [onGameChange]);

  /**
   * Navigate to a specific move
   */
  const goToMove = useCallback((moveIndex) => {
    if (moveIndex < -1 || moveIndex >= gameHistory.length) return;
    
    const chess = new Chess();
    
    // Replay moves up to the specified index
    for (let i = 0; i <= moveIndex; i++) {
      if (gameHistory[i]) {
        chess.move(gameHistory[i]);
      }
    }
    
    setCurrentGame(chess);
    setCurrentMoveIndex(moveIndex);
    setPosition(chess.fen());
    
    if (onMoveChange) {
      onMoveChange(moveIndex, gameHistory[moveIndex]);
    }
  }, [gameHistory, onMoveChange]);

  /**
   * Navigation functions
   */
  const goToFirst = useCallback(() => goToMove(-1), [goToMove]);
  const goToLast = useCallback(() => goToMove(gameHistory.length - 1), [goToMove, gameHistory.length]);
  const goToPrevious = useCallback(() => goToMove(currentMoveIndex - 1), [goToMove, currentMoveIndex]);
  const goToNext = useCallback(() => goToMove(currentMoveIndex + 1), [goToMove, currentMoveIndex]);

  /**
   * Auto-play functionality
   */
  const startAutoPlay = useCallback(() => {
    setIsPlaying(true);
    autoPlayRef.current = setInterval(() => {
      setCurrentMoveIndex(prevIndex => {
        if (prevIndex >= gameHistory.length - 1) {
          setIsPlaying(false);
          return prevIndex;
        }
        const nextIndex = prevIndex + 1;
        goToMove(nextIndex);
        return nextIndex;
      });
    }, autoPlayDelay);
  }, [gameHistory.length, autoPlayDelay, goToMove]);

  const stopAutoPlay = useCallback(() => {
    setIsPlaying(false);
    if (autoPlayRef.current) {
      clearInterval(autoPlayRef.current);
      autoPlayRef.current = null;
    }
  }, []);

  const toggleAutoPlay = useCallback(() => {
    if (isPlaying) {
      stopAutoPlay();
    } else {
      startAutoPlay();
    }
  }, [isPlaying, startAutoPlay, stopAutoPlay]);

  /**
   * Theme toggle
   */
  const toggleTheme = useCallback(() => {
    setLocalTheme(prev => prev === 'light' ? 'dark' : 'light');
  }, []);

  /**
   * Handle game selection
   */
  const selectGame = useCallback((gameIndex) => {
    if (gameIndex >= 0 && gameIndex < games.length) {
      setCurrentGameIndex(gameIndex);
      loadGame(games[gameIndex]);
    }
  }, [games, loadGame]);

  /**
   * Handle file upload
   */
  const handleFileUpload = useCallback((event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target.result;
        parsePGN(content);
      };
      reader.readAsText(file);
    }
  }, [parsePGN]);

  // Effects
  useEffect(() => {
    if (initialPgn) {
      parsePGN(initialPgn);
    }
  }, [initialPgn, parsePGN]);

  useEffect(() => {
    if (autoPlay && !isPlaying && gameHistory.length > 0) {
      startAutoPlay();
    }
  }, [autoPlay, isPlaying, gameHistory.length, startAutoPlay]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current);
      }
    };
  }, []);


  const currentGameData = games[currentGameIndex];

  return (
    <section
      className={`pgn-viewer rounded-2xl mx-auto sm:p-6 md:p-8 max-w-7xl w-full ${className}`}
      style={{ minHeight: 400 }}
      aria-label="PGN Viewer Panel"
    >
      {error && <ErrorBanner error={error} />}
      <ViewerHeader
        localTheme={localTheme}
        toggleTheme={toggleTheme}
        showSettings={showSettings}
        setShowSettings={setShowSettings}
        handleFileUpload={handleFileUpload}
      />
      {games.length > 1 && (
        <GameSelector
          games={games}
          currentGameIndex={currentGameIndex}
          selectGame={selectGame}
          localTheme={localTheme}
        />
      )}
      <div className="flex flex-col md:flex-row flex-wrap gap-8 items-stretch">
        <div
          className="flex flex-col items-center md:items-start rounded-xl md:mb-0"
          style={{
            flex: `0 1 ${responsiveBoardWidth}px`,
            minWidth: 220,
            maxWidth: 600,
            width: '100%',
          }}
        >
          <div className="w-full flex justify-center md:justify-start mb-4">
            {currentGameData && (
              <div className="w-full aspect-square">
                <Chessboard
                  position={position}
                  boardWidth={responsiveBoardWidth}
                  boardOrientation={orientation}
                  customBoardStyle={{ borderRadius: '8px', boxShadow: '0 4px 16px 0 rgba(0,0,0,0.08)' }}
                  customDarkSquareStyle={{ backgroundColor: localTheme === 'dark' ? '#4a4a4a' : '#b58863' }}
                  customLightSquareStyle={{ backgroundColor: localTheme === 'dark' ? '#6a6a6a' : '#f0d9b5' }}
                  arePiecesDraggable={allowMoves}
                />
              </div>
            )}
          </div>
          {showControls && (
            <div className="w-full flex justify-center mt-2">
              <NavigationControls
                goToFirst={goToFirst}
                goToPrevious={goToPrevious}
                toggleAutoPlay={toggleAutoPlay}
                goToNext={goToNext}
                goToLast={goToLast}
                isPlaying={isPlaying}
                currentMoveIndex={currentMoveIndex}
                gameHistoryLength={gameHistory.length}
              />
            </div>
          )}
        </div>
        <div
          className="flex flex-col gap-6"
          style={{
            flex: '1 1 300px',
            minWidth: 220,
            maxWidth: 700,
            width: '100%',
            overflow: 'auto',
          }}
        >
          {showHeaders && currentGameData && (
            <GameHeadersPanel gameHeaders={gameHeaders} localTheme={localTheme} />
          )}
          {showMoveList && (
            <MoveListPanel
              gameHistory={gameHistory}
              currentMoveIndex={currentMoveIndex}
              goToMove={goToMove}
              moveAnnotations={moveAnnotations}
              variations={variations}
              localTheme={localTheme}
            />
          )}
        </div>
      </div>
      {gameHistory.length > 0 && (
        <div className="mt-8">
          <ProgressIndicator currentMoveIndex={currentMoveIndex} gameHistoryLength={gameHistory.length} />
        </div>
      )}
    </section>
  );
});

function ErrorBanner({ error }) {
  return (
    <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded shadow-md" role="alert" aria-live="assertive">
      <span className="font-semibold mr-2">Error:</span>
      {error}
    </div>
  );
}

function ViewerHeader({ localTheme, toggleTheme, showSettings, setShowSettings, handleFileUpload }) {
  return (
    <header className="flex justify-between items-center mb-6">
      <h2 className="text-2xl font-bold text-primary">PGN Viewer</h2>
      <div className="flex items-center space-x-2">
        <label className="cursor-pointer p-2 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-accent hover:bg-gray-light transition-all duration-200" aria-label="Upload PGN file">
          <ArrowUpTrayIcon className="w-5 h-5" />
          <input
            type="file"
            accept=".pgn,.txt"
            onChange={handleFileUpload}
            className="hidden"
          />
        </label>
        <button
          onClick={toggleTheme}
          className="p-2 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-accent hover:bg-gray-light transition-all duration-200"
          aria-label="Toggle theme"
        >
          {localTheme === 'light' ? <MoonIcon className="w-5 h-5" /> : <SunIcon className="w-5 h-5" />}
        </button>
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="p-2 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-accent hover:bg-gray-light transition-all duration-200"
          aria-label="Show settings"
        >
          <Cog6ToothIcon className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
}

function GameSelector({ games, currentGameIndex, selectGame, localTheme }) {
  return (
    <div className="mb-6 bg-background-light dark:bg-background-dark border border-gray-light shadow-md rounded-xl p-4">
      <label className="block text-sm font-medium mb-2 text-primary">Select Game:</label>
      <select
        value={currentGameIndex}
        onChange={e => selectGame(parseInt(e.target.value))}
        className={`w-full p-2 border rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-accent transition-all duration-200 ${localTheme === 'dark' ? 'bg-gray-dark border-gray-dark text-text-light' : 'bg-background-light border-gray-light text-text-dark'}`}
        aria-label="Select game"
      >
        {games.map((game, index) => {
          const whitePlayer = typeof game.headers.White === 'object' ? (game.headers.White?.value || 'Unknown') : (game.headers.White || 'Unknown');
          const blackPlayer = typeof game.headers.Black === 'object' ? (game.headers.Black?.value || 'Unknown') : (game.headers.Black || 'Unknown');
          let gameDate = '';
          if (game.headers.Date) {
            if (typeof game.headers.Date === 'object') {
              if (game.headers.Date.value) {
                gameDate = game.headers.Date.value;
              } else if (game.headers.Date.year && game.headers.Date.month && game.headers.Date.day) {
                gameDate = `${game.headers.Date.year}.${String(game.headers.Date.month).padStart(2, '0')}.${String(game.headers.Date.day).padStart(2, '0')}`;
              }
            } else {
              gameDate = String(game.headers.Date);
            }
          }
          return (
            <option key={index} value={index}>
              Game {index + 1}: {whitePlayer} vs {blackPlayer}{gameDate && ` (${gameDate})`}
            </option>
          );
        })}
      </select>
    </div>
  );
}

function NavigationControls({
  goToFirst,
  goToPrevious,
  toggleAutoPlay,
  goToNext,
  goToLast,
  isPlaying,
  currentMoveIndex,
  gameHistoryLength
}) {
  return (
    <div className="flex items-center justify-center gap-2 mt-1">
      <button
        onClick={goToFirst}
        disabled={currentMoveIndex <= -1}
        className="p-2 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:opacity-50 hover:bg-gray-light transition-all duration-200"
        aria-label="First move"
      >
        <ChevronDoubleLeftIcon className="w-5 h-5" />
      </button>
      <button
        onClick={goToPrevious}
        disabled={currentMoveIndex <= -1}
        className="p-2 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:opacity-50 hover:bg-gray-light transition-all duration-200"
        aria-label="Previous move"
      >
        <BackwardIcon className="w-5 h-5" />
      </button>
      <button
        onClick={toggleAutoPlay}
        disabled={gameHistoryLength === 0}
        className="p-2 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:opacity-50 hover:bg-gray-light transition-all duration-200"
        aria-label={isPlaying ? 'Pause autoplay' : 'Play autoplay'}
      >
        {isPlaying ? <PauseIcon className="w-5 h-5" /> : <PlayIcon className="w-5 h-5" />}
      </button>
      <button
        onClick={goToNext}
        disabled={currentMoveIndex >= gameHistoryLength - 1}
        className="p-2 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:opacity-50 hover:bg-gray-light transition-all duration-200"
        aria-label="Next move"
      >
        <ForwardIcon className="w-5 h-5" />
      </button>
      <button
        onClick={goToLast}
        disabled={currentMoveIndex >= gameHistoryLength - 1}
        className="p-2 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:opacity-50 hover:bg-gray-light transition-all duration-200"
        aria-label="Last move"
      >
        <ChevronDoubleRightIcon className="w-5 h-5" />
      </button>
    </div>
  );
}

function GameHeadersPanel({ gameHeaders, localTheme }) {
  return (
    <div className={`p-3 border rounded shadow-sm ${localTheme === 'dark' ? 'border-gray-dark bg-gray-dark' : 'border-gray-light bg-background-light'}`}>
      <h3 className="font-semibold text-primary mb-2 flex items-center gap-2">
        {/* Lucide icon: Info */}
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M12 20a8 8 0 100-16 8 8 0 000 16z" /></svg>
        Game Information
      </h3>
      <div className="space-y-1 text-sm">
        {Object.entries(gameHeaders).map(([key, value]) => {
          let displayValue = value;
          if (typeof value === 'object' && value !== null) {
            if (value.value) {
              displayValue = value.value;
            } else if (value.year && value.month && value.day) {
              displayValue = `${value.year}.${String(value.month).padStart(2, '0')}.${String(value.day).padStart(2, '0')}`;
            } else {
              displayValue = JSON.stringify(value);
            }
          }
          return (
            <div key={key} className="flex justify-between">
              <span className="font-medium">{key}:</span>
              <span>{String(displayValue)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function MoveListPanel({ gameHistory, currentMoveIndex, goToMove, moveAnnotations, variations, localTheme }) {
  return (
    <div className={`p-3 border rounded shadow-sm ${localTheme === 'dark' ? 'border-gray-dark bg-gray-dark' : 'border-gray-light bg-background-light'}`}>
      <h3 className="font-semibold text-primary mb-2 flex items-center gap-2">
        {/* Lucide icon: List */}
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
        Moves
      </h3>
      <div className="max-h-96 overflow-y-auto">
        <div className="grid grid-cols-2 gap-1 text-sm">
          {gameHistory.map((move, index) => {
            const moveNumber = Math.ceil((index + 1) / 2);
            const isWhiteMove = index % 2 === 0;
            const isCurrentMove = index === currentMoveIndex;
            return (
              <React.Fragment key={index}>
                {isWhiteMove && (
                  <div className="font-medium text-gray-dark ">{moveNumber}.</div>
                )}
                <button
                  onClick={() => goToMove(index)}
                  className={`text-left px-2 py-1 rounded hover:bg-accent/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent transition-all duration-200 ${isCurrentMove ? 'bg-accent/20 ' : ''}`}
                  aria-label={`Go to move ${index + 1}`}
                >
                  {move.san}
                  {moveAnnotations[index] && (
                    <span className="ml-1 text-xs text-accent" title="Comment">
                      {/* Lucide icon: MessageCircle */}
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7A8.38 8.38 0 013 12.5c0-4.7 4.5-8.5 10-8.5s10 3.8 10 8.5z" /></svg>
                    </span>
                  )}
                  {variations[index] && (
                    <span className="ml-1 text-xs text-green-600" title="Variation">
                      {/* Lucide icon: Branch */}
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 3v12a3 3 0 003 3h6a3 3 0 003-3V3" /></svg>
                    </span>
                  )}
                </button>
              </React.Fragment>
            );
          })}
        </div>
        {moveAnnotations[currentMoveIndex] && (
          <div className="mt-3 p-2 bg-accent/10 rounded text-sm flex items-center gap-2">
            {/* Lucide icon: MessageCircle */}
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7A8.38 8.38 0 013 12.5c0-4.7 4.5-8.5 10-8.5s10 3.8 10 8.5z" /></svg>
            <strong>Comment:</strong> {moveAnnotations[currentMoveIndex]}
          </div>
        )}
      </div>
    </div>
  );
}

function ProgressIndicator({ currentMoveIndex, gameHistoryLength }) {
  const percent = Math.round(((currentMoveIndex + 1) / gameHistoryLength) * 100);
  return (
    <div className="mt-4 bg-background-light dark:bg-background-dark border border-gray-light shadow-sm rounded-xl p-3">
      <div className="flex justify-between text-sm text-gray-dark mb-1">
        <span>Move {currentMoveIndex + 1} of {gameHistoryLength}</span>
        <span>{percent}%</span>
      </div>
      <div className="w-full bg-gray-light rounded-full h-2">
        <div
          className="bg-accent h-2 rounded-full transition-all duration-300"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

export default PGNViewer;

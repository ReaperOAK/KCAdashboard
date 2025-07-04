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

      console.log('Parsing PGN:', pgnText.substring(0, 200) + '...');

      // Use @mliebelt/pgn-parser for complex PGN parsing
      const parsedGames = parse(pgnText, { startRule: 'games' });
      console.log('PGN parsed successfully, games found:', parsedGames.length);
      
      const processedGames = parsedGames.map((game, index) => {
        const chess = new Chess();
        const moveHistory = [];
        const annotations = {};
        const gameVariations = {};
        
        // Extract headers
        const headers = {};
        if (game.tags) {
          console.log('Processing tags for game', index, '- Type:', typeof game.tags, 'IsArray:', Array.isArray(game.tags));
          
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
            console.log('Game has moves array but no valid move notations - likely manually parsed');
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

  const themeClasses = localTheme === 'dark'
    ? 'bg-background-dark text-text-light border-gray-dark'
    : 'bg-background-light text-text-dark border-gray-light';

  const currentGameData = games[currentGameIndex];

  return (
    <div className={`pgn-viewer p-4 rounded-lg border ${themeClasses} ${className}`}>
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="flex flex-col">
          <div className="mb-4">
            {currentGameData && (
              <Chessboard
                position={position}
                boardWidth={width}
                boardOrientation={orientation}
                customBoardStyle={{ borderRadius: '4px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                customDarkSquareStyle={{ backgroundColor: localTheme === 'dark' ? '#4a4a4a' : '#b58863' }}
                customLightSquareStyle={{ backgroundColor: localTheme === 'dark' ? '#6a6a6a' : '#f0d9b5' }}
                arePiecesDraggable={allowMoves}
              />
            )}
          </div>
          {showControls && (
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
          )}
        </div>
        <div className="flex flex-col space-y-4">
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
        <ProgressIndicator currentMoveIndex={currentMoveIndex} gameHistoryLength={gameHistory.length} />
      )}
    </div>
  );
});

function ErrorBanner({ error }) {
  return (
    <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded" role="alert">
      {error}
    </div>
  );
}

function ViewerHeader({ localTheme, toggleTheme, showSettings, setShowSettings, handleFileUpload }) {
  return (
    <div className="flex justify-between items-center mb-4">
      <h2 className="text-xl font-bold">PGN Viewer</h2>
      <div className="flex items-center space-x-2">
        <label className="cursor-pointer p-2 rounded hover:bg-gray-light ">
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
          className="p-2 rounded hover:bg-gray-light "
          aria-label="Toggle theme"
        >
          {localTheme === 'light' ? <MoonIcon className="w-5 h-5" /> : <SunIcon className="w-5 h-5" />}
        </button>
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="p-2 rounded hover:bg-gray-light "
          aria-label="Show settings"
        >
          <Cog6ToothIcon className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

function GameSelector({ games, currentGameIndex, selectGame, localTheme }) {
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium mb-2">Select Game:</label>
      <select
        value={currentGameIndex}
        onChange={e => selectGame(parseInt(e.target.value))}
        className={`w-full p-2 border rounded ${localTheme === 'dark' ? 'bg-gray-dark border-gray-dark' : 'bg-background-light border-gray-light'}`}
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
    <div className="flex items-center justify-center space-x-2 mt-1">
      <button
        onClick={goToFirst}
        disabled={currentMoveIndex <= -1}
        className="p-2 rounded disabled:opacity-50 hover:bg-gray-light "
        aria-label="First move"
      >
        <ChevronDoubleLeftIcon className="w-5 h-5" />
      </button>
      <button
        onClick={goToPrevious}
        disabled={currentMoveIndex <= -1}
        className="p-2 rounded disabled:opacity-50 hover:bg-gray-light "
        aria-label="Previous move"
      >
        <BackwardIcon className="w-5 h-5" />
      </button>
      <button
        onClick={toggleAutoPlay}
        disabled={gameHistoryLength === 0}
        className="p-2 rounded disabled:opacity-50 hover:bg-gray-light "
        aria-label={isPlaying ? 'Pause autoplay' : 'Play autoplay'}
      >
        {isPlaying ? <PauseIcon className="w-5 h-5" /> : <PlayIcon className="w-5 h-5" />}
      </button>
      <button
        onClick={goToNext}
        disabled={currentMoveIndex >= gameHistoryLength - 1}
        className="p-2 rounded disabled:opacity-50 hover:bg-gray-light "
        aria-label="Next move"
      >
        <ForwardIcon className="w-5 h-5" />
      </button>
      <button
        onClick={goToLast}
        disabled={currentMoveIndex >= gameHistoryLength - 1}
        className="p-2 rounded disabled:opacity-50 hover:bg-gray-light "
        aria-label="Last move"
      >
        <ChevronDoubleRightIcon className="w-5 h-5" />
      </button>
    </div>
  );
}

function GameHeadersPanel({ gameHeaders, localTheme }) {
  return (
    <div className={`p-3 border rounded ${localTheme === 'dark' ? 'border-gray-dark bg-gray-dark' : 'border-gray-light bg-background-light'}`}>
      <h3 className="font-semibold mb-2">Game Information</h3>
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
    <div className={`p-3 border rounded ${localTheme === 'dark' ? 'border-gray-dark bg-gray-dark' : 'border-gray-light bg-background-light'}`}>
      <h3 className="font-semibold mb-2">Moves</h3>
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
                  className={`text-left px-2 py-1 rounded hover:bg-accent/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent ${isCurrentMove ? 'bg-accent/20 ' : ''}`}
                  aria-label={`Go to move ${index + 1}`}
                >
                  {move.san}
                  {moveAnnotations[index] && (
                    <span className="ml-1 text-xs text-accent">💬</span>
                  )}
                  {variations[index] && (
                    <span className="ml-1 text-xs text-green-600 ">🌳</span>
                  )}
                </button>
              </React.Fragment>
            );
          })}
        </div>
        {moveAnnotations[currentMoveIndex] && (
          <div className="mt-3 p-2 bg-accent/10  rounded text-sm">
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
    <div className="mt-4">
      <div className="flex justify-between text-sm text-gray-dark  mb-1">
        <span>Move {currentMoveIndex + 1} of {gameHistoryLength}</span>
        <span>{percent}%</span>
      </div>
      <div className="w-full bg-gray-light  rounded-full h-2">
        <div
          className="bg-accent h-2 rounded-full transition-all duration-300"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

export default PGNViewer;

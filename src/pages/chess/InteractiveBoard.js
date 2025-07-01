import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ChessBoard from '../../components/chess/ChessBoard';
import ChessNavigation from '../../components/chess/ChessNavigation';
import ApiService from '../../utils/api';

// --- Loading Spinner ---
const LoadingSpinner = React.memo(({ label }) => (
  <div className="flex justify-center items-center min-h-96 text-primary font-bold text-lg" role="status" aria-live="polite">
    <svg className="animate-spin h-8 w-8 text-accent mr-3" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
    </svg>
    <span>{label}</span>
  </div>
));

// --- Error State ---
const ErrorState = React.memo(({ message, onReload }) => (
  <div className="flex flex-col items-center justify-center min-h-96 space-y-4" role="alert">
    <div className="text-red-700 font-bold text-center">{message}</div>
    {onReload && (
      <button
        type="button"
        onClick={onReload}
        className="px-4 py-2 bg-primary text-white rounded hover:bg-secondary transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      >
        Reload Page
      </button>
    )}
  </div>
));

// --- Simul/Active Games Switcher ---
const GameSwitcher = React.memo(({ activeGames, currentId, onSwitch }) => (
  <div className="mb-6 flex flex-col xs:flex-row items-start xs:items-center gap-2">
    <span className="font-semibold">Switch Game:</span>
    <label htmlFor="game-switcher" className="sr-only">Select active game</label>
    <select
      id="game-switcher"
      value={currentId}
      onChange={onSwitch}
      className="border border-gray-light rounded px-2 py-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
    >
      {activeGames.map(game => (
        <option key={game.id} value={game.id}>
          vs {game.opponent?.name || 'Unknown'} ({game.yourColor})
          {game.status === 'active' ? '' : ' (ended)'}
        </option>
      ))}
    </select>
  </div>
));

// --- PGN Download Button ---
const PGNDownloadButton = React.memo(({ id, pgn }) => {
  const handleDownload = useCallback(() => {
    const blob = new Blob([pgn], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `game-${id}.pgn`;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
  }, [id, pgn]);
  return (
    <div className="mb-4 flex justify-end">
      <button
        type="button"
        className="px-4 py-2 bg-accent text-white rounded hover:bg-secondary transition-colors font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        onClick={handleDownload}
        aria-label="Download PGN file"
      >
        Download PGN
      </button>
    </div>
  );
});

// --- Game Info Card ---
const GameInfoCard = React.memo(({ gameData, lastMoveAt, formatIST }) => (
  <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm max-w-2xl mx-auto mt-6">
    <h2 className="text-lg sm:text-xl font-bold text-primary mb-3 sm:mb-4">Game Information</h2>
    {gameData.status === 'abandoned' && (
      <div className="bg-orange-50 border border-orange-200 p-4 rounded-lg mb-4">
        <div className="text-orange-800 font-semibold">Game Expired</div>
        <div className="text-orange-700 text-sm">
          This game was automatically expired due to inactivity.
          {gameData.reason === 'inactivity timeout' && ' No moves were made for an extended period.'}
        </div>
      </div>
    )}
    <div className="space-y-2">
      <p><strong className="text-gray-dark">Opponent:</strong> <span className="text-gray-900">{gameData.opponent && gameData.opponent.name}</span></p>
      <p><strong className="text-gray-dark">Your Color:</strong> <span className="text-gray-900 capitalize">{gameData.yourColor}</span></p>
      <p><strong className="text-gray-dark">Time Control:</strong> <span className="text-gray-900">{gameData.timeControl || 'Standard'}</span></p>
      <p><strong className="text-gray-dark">Turn:</strong> <span className={`font-semibold ${gameData.yourTurn ? 'text-green-600' : 'text-blue-600'}`}>{gameData.yourTurn ? 'Your move' : "Opponent's move"}</span></p>
      {lastMoveAt && (
        <p>
          <strong className="text-gray-dark">Last Move:</strong>
          <span className="text-gray-900">{formatIST(lastMoveAt)}</span>
        </p>
      )}
    </div>
  </div>
));


const InteractiveBoard = React.memo(() => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [position, setPosition] = useState('start');
  const [loading, setLoading] = useState(!!id);
  const [error, setError] = useState(null);
  const [gameData, setGameData] = useState(null);
  const [orientation, setOrientation] = useState('white');
  const [lastMoveAt, setLastMoveAt] = useState(null);
  const [activeGames, setActiveGames] = useState([]);
  const [pgn, setPgn] = useState('');
  const [moveHistory, setMoveHistory] = useState([]);
  const [fenHistory, setFenHistory] = useState([]);
  const [currentMoveIndex, setCurrentMoveIndex] = useState(-1);

  // Fetch active games for switcher (simul support)
  useEffect(() => {
    ApiService.getChessGames('active').then(res => {
      if (res.success && Array.isArray(res.games)) {
        let userId = null;
        try {
          const userStr = localStorage.getItem('user');
          if (userStr) {
            const userObj = JSON.parse(userStr);
            userId = userObj.id || userObj.user_id || userObj._id;
          }
        } catch {}
        if (!userId && res.games.length > 0) {
          userId = res.games[0].white_player?.id;
        }
        const gamesWithOpponent = res.games.map(game => {
          let yourColor = '';
          let opponent = { name: 'Unknown' };
          if (userId) {
            if (game.white_player && String(game.white_player.id) === String(userId)) {
              yourColor = 'white';
              opponent = game.black_player || { name: 'Unknown' };
            } else if (game.black_player && String(game.black_player.id) === String(userId)) {
              yourColor = 'black';
              opponent = game.white_player || { name: 'Unknown' };
            }
          }
          return { ...game, yourColor, opponent };
        });
        setActiveGames(gamesWithOpponent);
      }
    });
  }, []);

  // Poll for game updates and handle game over
  const pollGameUpdates = useCallback(async () => {
    if (!id) return;
    try {
      const response = await ApiService.getGameDetails(id);
      if (response.success && response.game) {
        if (response.game.status && response.game.status !== 'active') {
          alert('Game over: ' + (response.game.reason || response.game.status) + '\nYou will be redirected to the game lobby.');
          navigate('/chess/play');
          setError('redirected-to-lobby');
          return;
        }
        if (response.game.position !== position) {
          setGameData(response.game);
          setPosition(response.game.position);
          setLastMoveAt(response.game.lastMove);
        }
      }
    } catch (err) {
      // Log error, but don't break polling
    }
  }, [id, position, navigate]);

  // Fetch move history, PGN, and FEN history from backend
  const fetchMoveHistory = useCallback(async (gameId) => {
    if (!gameId) return;
    try {
      const res = await ApiService.getMoveHistory(gameId);
      if (res && res.success) {
        setPgn(res.pgn || '');
        setMoveHistory(res.moves || []);
        setFenHistory(res.fen_history || []);
        setCurrentMoveIndex((res.moves && res.moves.length > 0) ? res.moves.length - 1 : -1);
      }
    } catch {}
  }, []);

  // Load game data and move history when ID is provided
  useEffect(() => {
    let pollInterval = null;
    if (id) {
      const loadGame = async () => {
        try {
          setLoading(true);
          const response = await ApiService.getGameDetails(id);
          if (response.success && response.game) {
            setGameData(response.game);
            setPosition(response.game.position || 'start');
            setLastMoveAt(response.game.lastMove);
            if (response.game.yourColor === 'black') {
              setOrientation('black');
            }
            fetchMoveHistory(id);
          } else {
            setError('Failed to load game data');
          }
        } catch {
          setError('Failed to load game. Please refresh the page.');
        } finally {
          setLoading(false);
        }
      };
      loadGame();
      pollInterval = setInterval(() => {
        pollGameUpdates();
        fetchMoveHistory(id);
      }, 2000);
    }
    return () => {
      if (pollInterval) clearInterval(pollInterval);
    };
  }, [id, pollGameUpdates, fetchMoveHistory]);

  // Check if a challenge has been accepted (only run when not viewing a game)
  useEffect(() => {
    let checkChallengeInterval = null;
    if (!id) {
      const checkForAcceptedChallenges = async () => {
        try {
          const response = await ApiService.getChallenges();
          if (response.success && response.challenges) {
            const acceptedChallenge = response.challenges.find(
              c => c.direction === 'outgoing' && c.gameId && c.status === 'accepted'
            );
            if (acceptedChallenge) {
              navigate(`/chess/game/${acceptedChallenge.gameId}`);
            }
          }
        } catch {}
      };
      checkForAcceptedChallenges();
      checkChallengeInterval = setInterval(checkForAcceptedChallenges, 3000);
    }
    return () => {
      if (checkChallengeInterval) clearInterval(checkChallengeInterval);
    };
  }, [id, navigate]);

  // Handle move submission
  const handleMove = useCallback(async (move, fen) => {
    if (!id) {
      setPosition(fen);
      return;
    }
    try {
      setPosition(fen);
      setGameData(prev => ({ ...prev, yourTurn: false }));
      await ApiService.makeGameMove(id, move, fen);
      fetchMoveHistory(id);
    } catch {
      const response = await ApiService.getGameDetails(id);
      if (response.success && response.game) {
        setGameData(response.game);
        setPosition(response.game.position);
      }
    }
  }, [id, fetchMoveHistory]);

  // Handle move selection from MoveHistory (jump to move)
  const handleGoToMove = useCallback((moveIndex) => {
    if (!fenHistory || fenHistory.length === 0) return;
    const fen = fenHistory[moveIndex + 1] || fenHistory[fenHistory.length - 1];
    setCurrentMoveIndex(moveIndex);
    setPosition(fen);
  }, [fenHistory]);

  // Helper to format date/time in IST
  const formatIST = useCallback((dateString) => {
    try {
      let s = dateString;
      if (s && !s.includes('T')) s = s.replace(' ', 'T');
      if (s && !s.endsWith('Z')) s += 'Z';
      const d = new Date(s);
      return d.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) + ' IST';
    } catch {
      return dateString;
    }
  }, []);

  // Memoized values for rendering
  const canShowGameSwitcher = useMemo(() => activeGames.length > 1 && id, [activeGames.length, id]);

  if (error === 'redirected-to-lobby') return null;
  if (loading) return <LoadingSpinner label="Loading chess board..." />;
  if (error) return <ErrorState message={error} onReload={() => window.location.reload()} />;

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-5 pb-8 sm:pb-10">
      <h1 className="text-2xl sm:text-3xl font-bold text-primary mb-4 sm:mb-5">{id ? 'Game Board' : 'Analysis Board'}</h1>
      <ChessNavigation />
      {canShowGameSwitcher && (
        <GameSwitcher activeGames={activeGames} currentId={id} onSwitch={e => navigate(`/chess/game/${e.target.value}`)} />
      )}
      {id && pgn && <PGNDownloadButton id={id} pgn={pgn} />}
      <div className="w-full max-w-full sm:max-w-2xl mx-auto flex justify-center mb-6">
        <ChessBoard
          position={position}
          orientation={orientation}
          allowMoves={id ? (gameData && gameData.yourTurn && gameData.status === 'active') : true}
          showHistory={true}
          showAnalysis={!id}
          onMove={handleMove}
          playMode={id ? 'vs-human' : 'analysis'}
          width={undefined}
          gameId={id}
          backendMoveHistory={moveHistory}
          fenHistory={fenHistory}
          currentMoveIndex={currentMoveIndex}
          goToMove={handleGoToMove}
          className="w-full h-auto"
        />
      </div>
      {gameData && (
        <GameInfoCard gameData={gameData} lastMoveAt={lastMoveAt} formatIST={formatIST} />
      )}
    </div>
  );
});

export default InteractiveBoard;

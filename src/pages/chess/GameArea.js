
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../../hooks/useAuth';
import PERMISSIONS, { checkPermission } from '../../utils/permissions';
import { useNavigate } from 'react-router-dom';
import ChessNavigation from '../../components/chess/ChessNavigation';
import ApiService from '../../utils/api';

// --- Utility Hooks ---
function useChessData(activeTab, gameStatus) {
  const [games, setGames] = useState([]);
  const [practicePositions, setPracticePositions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      setLoading(true);
      setError(null);
      try {
        if (activeTab === 'games') {
          const gamesResponse = await ApiService.getChessGames(gameStatus);
          if (isMounted && gamesResponse.success) setGames(gamesResponse.games || []);
        }
        if (activeTab === 'practice') {
          const practiceResponse = await ApiService.getPracticePositions();
          if (isMounted && practiceResponse.success) setPracticePositions(practiceResponse.positions || []);
        }
      } catch (err) {
        if (isMounted) setError(err.message || 'Failed to load chess data');
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadData();
    return () => { isMounted = false; };
  }, [activeTab, gameStatus]);

  return { games, practicePositions, loading, error };
}

// --- Utility Functions ---
const formatDate = (dateString) => {
  try {
    let s = dateString;
    if (s && !s.includes('T')) s = s.replace(' ', 'T');
    if (s && !s.endsWith('Z')) s += 'Z';
    const d = new Date(s);
    return d.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) + ' IST';
  } catch {
    return dateString;
  }
};

// --- Loading & Error States ---
const LoadingSpinner = React.memo(({ label }) => (
  <div className="flex flex-col items-center justify-center py-16" role="status" aria-live="polite">
    <svg className="animate-spin h-8 w-8 text-accent mb-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
    </svg>
    <span className="text-accent font-semibold">{label}</span>
  </div>
));

const ErrorState = React.memo(({ message }) => (
  <div className="flex flex-col items-center justify-center py-16" role="alert">
    <span className="text-red-700 font-semibold">{message}</span>
  </div>
));

// --- Tab Navigation ---
const TabNav = React.memo(({ activeTab, onTabChange, onFindOpponents }) => (
  <nav className="flex overflow-x-auto no-scrollbar border-b border-gray-dark mb-6" aria-label="Chess area tabs">
    <div className="flex min-w-full sm:min-w-0">
      <button
        type="button"
        className={`px-4 sm:px-6 py-2 sm:py-3 bg-transparent border-none cursor-pointer text-base transition-all duration-200 relative focus:outline-none focus-visible:ring-2 focus-visible:ring-accent whitespace-nowrap ${
          activeTab === 'games'
            ? 'text-primary font-bold after:content-[] after:absolute after:-bottom-px after:left-0 after:w-full after:h-0.5 after:bg-primary'
            : 'text-gray-dark hover:bg-background-light'
        }`}
        aria-current={activeTab === 'games' ? 'page' : undefined}
        onClick={onTabChange('games')}
      >
        My Games
      </button>
      <button
        type="button"
        className={`px-4 sm:px-6 py-2 sm:py-3 bg-transparent border-none cursor-pointer text-base transition-all duration-200 relative focus:outline-none focus-visible:ring-2 focus-visible:ring-accent whitespace-nowrap ${
          activeTab === 'practice'
            ? 'text-primary font-bold after:content-[] after:absolute after:-bottom-px after:left-0 after:w-full after:h-0.5 after:bg-primary'
            : 'text-gray-dark hover:bg-background-light'
        }`}
        aria-current={activeTab === 'practice' ? 'page' : undefined}
        onClick={onTabChange('practice')}
      >
        Practice Positions
      </button>
      <button
        type="button"
        className="px-4 sm:px-6 py-2 sm:py-3 bg-transparent border-none cursor-pointer text-base transition-all duration-200 relative text-gray-dark hover:bg-background-light focus:outline-none focus-visible:ring-2 focus-visible:ring-accent whitespace-nowrap"
        onClick={onFindOpponents}
      >
        Find Opponents
      </button>
    </div>
  </nav>
));

// --- Game Card ---
const GameCard = React.memo(({ game, onSelect }) => (
  <button
    type="button"
    className="bg-white rounded-lg overflow-hidden shadow-md transition-all duration-200 cursor-pointer hover:-translate-y-1 hover:shadow-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-accent text-left"
    onClick={() => onSelect(game)}
    aria-label={`View game between ${game.white_player.name} and ${game.black_player.name}`}
  >
    <div className="h-36 bg-background-light flex items-center justify-center border-b border-gray-light">
      {game.preview_url ? (
        <img
          src={game.preview_url}
          alt="Chess game preview"
          className="w-28 h-28 object-contain border border-gray-light rounded"
        />
      ) : (
        <div className="w-28 h-28 bg-gray-light border border-gray-light rounded" aria-hidden="true" />
      )}
    </div>
    <div className="p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-primary font-semibold">{game.white_player.name}</span>
        <span className="text-gray-dark text-sm">vs</span>
        <span className="text-primary font-semibold">{game.black_player.name}</span>
      </div>
      <div className="flex justify-between items-center mb-3 text-sm text-gray-dark">
        <span>{game.time_control || 'Standard'}</span>
        <span>{formatDate(game.last_move_at)}</span>
      </div>
      <div className="flex justify-between items-center">
        <span className={`px-2 py-1 rounded text-xs font-medium capitalize ${
          game.status === 'active' ? 'bg-green-100 text-green-800' :
          game.status === 'completed' ? 'bg-gray-light text-gray-dark' :
          game.status === 'abandoned' ? 'bg-orange-100 text-orange-800' :
          'bg-blue-100 text-blue-800'
        }`}>
          {game.status === 'abandoned' ? 'Expired' : game.status}
        </span>
        {game.result && (
          <span className="px-2 py-1 bg-accent text-white rounded text-xs font-medium">{game.result}</span>
        )}
      </div>
    </div>
  </button>
));

// --- Practice Card ---
const PracticeCard = React.memo(({ position, onSelect }) => (
  <button
    type="button"
    className="bg-white rounded-lg overflow-hidden shadow-md transition-all duration-200 cursor-pointer hover:-translate-y-1 hover:shadow-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-accent text-left"
    onClick={() => onSelect(position)}
    aria-label={`Practice position: ${position.title}`}
  >
    <div className="h-36 bg-background-light flex items-center justify-center border-b border-gray-light">
      {position.preview_url ? (
        <img
          src={position.preview_url}
          alt="Practice position preview"
          className="w-28 h-28 object-contain border border-gray-light rounded"
        />
      ) : (
        <div className="w-28 h-28 bg-gray-light border border-gray-light rounded" aria-hidden="true" />
      )}
    </div>
    <div className="p-4">
      <h3 className="text-lg font-semibold text-primary mb-2">{position.title}</h3>
      <p className="text-gray-dark text-sm mb-3 line-clamp-2">{position.description}</p>
      <div className="flex justify-between items-center mb-2">
        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium capitalize">{position.type}</span>
        <span className={`px-2 py-1 rounded text-xs font-medium capitalize ${
          position.difficulty === 'beginner' ? 'bg-green-100 text-green-800' :
          position.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
          'bg-red-100 text-red-800'
        }`}>
          {position.difficulty}
        </span>
      </div>
      <div className="text-xs text-gray-500">By {position.creator.name}</div>
    </div>
  </button>
));

// --- Empty State ---
const EmptyState = React.memo(({ message, actionLabel, onAction }) => (
  <div className="bg-background-light p-8 rounded-lg text-center">
    <p className="mb-4 text-gray-dark">{message}</p>
    {actionLabel && (
      <button
        type="button"
        onClick={onAction}
        className="px-4 py-2 bg-primary text-white rounded hover:bg-secondary transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      >
        {actionLabel}
      </button>
    )}
  </div>
));

// --- Main Component ---

function GameArea() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('games');
  const [gameStatus, setGameStatus] = useState('all');
  const { games, practicePositions, loading, error } = useChessData(activeTab, gameStatus);
  const { user } = useAuth();

  // Upload modal state
  const [showUpload, setShowUpload] = useState(false);
  const [uploadData, setUploadData] = useState({ title: '', description: '', position: '', type: 'fen', difficulty: 'beginner' });
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);

  // Memoized handlers
  const handleTabChange = useCallback(
    (tab) => () => setActiveTab(tab),
    []
  );
  const handleFindOpponents = useCallback(() => navigate('/chess/play'), [navigate]);
  const handleGameStatusChange = useCallback((e) => setGameStatus(e.target.value), []);

  // Handle game selection and PGN download for completed games
  const handleSelectGame = useCallback(async (game) => {
    if (game.status === 'completed') {
      try {
        const res = await ApiService.getMoveHistory(game.id);
        if (res && res.success && res.pgn) {
          const blob = new Blob([res.pgn], { type: 'text/plain' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `game-${game.id}.pgn`;
          document.body.appendChild(a);
          a.click();
          setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
          }, 100);
        }
      } catch {
        alert('Failed to download PGN.');
      }
    } else {
      navigate(`/chess/game/${game.id}`);
    }
  }, [navigate]);

  // Handle practice position selection
  const handleSelectPractice = useCallback((position) => {
    navigate('/chess/board', { state: { position: position.position } });
  }, [navigate]);

  // Memoized lists
  const gameCards = useMemo(() =>
    games.map((game) => (
      <GameCard key={game.id} game={game} onSelect={handleSelectGame} />
    )), [games, handleSelectGame]
  );
  const practiceCards = useMemo(() =>
    practicePositions.map((position) => (
      <PracticeCard key={position.id} position={position} onSelect={handleSelectPractice} />
    )), [practicePositions, handleSelectPractice]
  );

  // Permission check
  const canUploadPractice = user && (user.role === 'admin' || checkPermission(user.permissions, PERMISSIONS.CHESS.UPLOAD_PRACTICE));

  // Upload handlers
  const openUploadModal = () => { setShowUpload(true); setUploadError(null); };
  const closeUploadModal = () => { setShowUpload(false); setUploadData({ title: '', description: '', position: '', type: 'fen', difficulty: 'beginner' }); setUploadError(null); };
  const handleUploadChange = (e) => {
    const { name, value } = e.target;
    setUploadData((prev) => ({ ...prev, [name]: value }));
  };
  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);
    setUploadError(null);
    try {
      const payload = { ...uploadData };
      // For FEN, backend expects 'position', for PGN, expects 'pgn_content'
      if (payload.type === 'fen') {
        payload.position = payload.position.trim();
      } else {
        payload.pgn_content = payload.position.trim();
        delete payload.position;
      }
      await ApiService.createPracticePosition(payload);
      closeUploadModal();
      window.location.reload(); // Reload to show new position
    } catch (err) {
      setUploadError(err.message || 'Failed to upload practice position');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-5 pb-8 sm:pb-10">
      <h1 className="text-2xl sm:text-3xl font-bold text-primary mb-4 sm:mb-5">Chess Game Area</h1>
      <ChessNavigation />
      <TabNav
        activeTab={activeTab}
        onTabChange={handleTabChange}
        onFindOpponents={handleFindOpponents}
      />

      {activeTab === 'games' && (
        <section aria-labelledby="games-heading">
          <div className="flex flex-col sm:flex-row sm:justify-end gap-3 mb-5">
            <label htmlFor="game-status" className="sr-only">Game Status</label>
            <select
              id="game-status"
              value={gameStatus}
              onChange={handleGameStatusChange}
              className="px-2 sm:px-3 py-2 border border-gray-light rounded text-base bg-white min-w-32 sm:min-w-40 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              <option value="active">Active Games</option>
              <option value="completed">Completed Games</option>
              <option value="all">All Games</option>
            </select>
          </div>
          {loading ? (
            <LoadingSpinner label="Loading games..." />
          ) : error ? (
            <ErrorState message={error} />
          ) : games.length === 0 ? (
            <EmptyState message="No games found. Challenge someone to play!" actionLabel="Find Opponents" onAction={handleFindOpponents} />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5" role="list" aria-label="Game list">
              {gameCards}
            </div>
          )}
        </section>
      )}

      {activeTab === 'practice' && (
        <section aria-labelledby="practice-heading">
          {canUploadPractice && (
            <div className="mb-5 flex flex-col sm:flex-row sm:justify-end gap-3">
              <button
                type="button"
                className="px-4 py-2 bg-primary text-white rounded hover:bg-secondary focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                onClick={openUploadModal}
              >
                Upload Practice Position
              </button>
            </div>
          )}
          {showUpload && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
              <form onSubmit={handleUploadSubmit} className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative">
                <h2 className="text-xl font-bold mb-4">Upload Practice Position</h2>
                {uploadError && <div className="mb-3 text-red-600">{uploadError}</div>}
                <div className="mb-3">
                  <label className="block mb-1 font-medium">Title</label>
                  <input name="title" value={uploadData.title} onChange={handleUploadChange} required className="w-full border rounded px-2 py-1" />
                </div>
                <div className="mb-3">
                  <label className="block mb-1 font-medium">Description</label>
                  <textarea name="description" value={uploadData.description} onChange={handleUploadChange} rows={2} className="w-full border rounded px-2 py-1" />
                </div>
                <div className="mb-3">
                  <label className="block mb-1 font-medium">Type</label>
                  <select name="type" value={uploadData.type} onChange={handleUploadChange} className="w-full border rounded px-2 py-1">
                    <option value="fen">FEN</option>
                    <option value="pgn">PGN</option>
                  </select>
                </div>
                <div className="mb-3">
                  <label className="block mb-1 font-medium">{uploadData.type === 'fen' ? 'FEN String' : 'PGN Content'}</label>
                  <textarea name="position" value={uploadData.position} onChange={handleUploadChange} rows={uploadData.type === 'fen' ? 2 : 6} required className="w-full border rounded px-2 py-1" />
                </div>
                <div className="mb-3">
                  <label className="block mb-1 font-medium">Difficulty</label>
                  <select name="difficulty" value={uploadData.difficulty} onChange={handleUploadChange} className="w-full border rounded px-2 py-1">
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
                <div className="flex justify-end gap-2 mt-4">
                  <button type="button" onClick={closeUploadModal} className="px-4 py-2 border rounded text-gray-700">Cancel</button>
                  <button type="submit" className="px-4 py-2 bg-primary text-white rounded" disabled={uploading}>{uploading ? 'Uploading...' : 'Upload'}</button>
                </div>
              </form>
            </div>
          )}
          {loading ? (
            <LoadingSpinner label="Loading practice positions..." />
          ) : error ? (
            <ErrorState message={error} />
          ) : practicePositions.length === 0 ? (
            <EmptyState message="No practice positions found." />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5" role="list" aria-label="Practice positions">
              {practiceCards}
            </div>
          )}
        </section>
      )}
    </div>
  );
}

export default React.memo(GameArea);

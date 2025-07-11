

import React, { useState, useCallback, useMemo } from 'react';
import { useAuth } from '../../hooks/useAuth';
import PERMISSIONS, { checkPermission } from '../../utils/permissions';
import { useNavigate } from 'react-router-dom';
import ChessNavigation from '../../components/chess/ChessNavigation';
import { ChessApi } from '../../api/chess';
import TabNav from '../../components/chess/TabNav';
import GameCard from '../../components/chess/GameCard';
import PracticeCard from '../../components/chess/PracticeCard';
import EmptyState from '../../components/chess/EmptyState';
import PracticeUploadModal from '../../components/chess/PracticeUploadModal';
import LoadingSpinner from '../../components/chess/LoadingSpinner';
import ErrorState from '../../components/chess/ErrorState';
import { useChessData } from '../../hooks/useChessData';

// Utility function for date formatting
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
        const res = await ChessApi.getMoveHistory(game.id);
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
      <GameCard key={game.id} game={game} onSelect={handleSelectGame} formatDate={formatDate} />
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
      await ChessApi.createPracticePosition(payload);
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
          <PracticeUploadModal
            show={showUpload}
            uploadData={uploadData}
            uploading={uploading}
            uploadError={uploadError}
            onChange={handleUploadChange}
            onClose={closeUploadModal}
            onSubmit={handleUploadSubmit}
          />
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

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  EyeIcon,
  ShareIcon,
  CalendarIcon,
  UserIcon,
  DocumentIcon,
  TagIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';
import { ChessApi } from '../../api/chess';
import usePGNView from '../../hooks/usePGNView';
import { useNavigate } from 'react-router-dom';

// --- Custom Styles ---
const gradientBg = 'bg-gradient-to-br from-blue-50 via-white to-accent/10';
const cardShadow = 'shadow-lg hover:shadow-2xl transition-shadow duration-300';
const glass = 'backdrop-blur-md bg-white/80';

// --- Utility Functions ---
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

// --- Subcomponents ---

const SearchBar = React.memo(({ value, onChange }) => (
  <div className="relative" role="search">
    <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-accent w-6 h-6 pointer-events-none" aria-hidden="true" />
    <input
      type="text"
      placeholder="Search games by title or description..."
      value={value}
      onChange={onChange}
      className="w-full pl-12 pr-4 py-3 border-2 border-accent/30 rounded-xl bg-white/80 text-text-dark text-lg focus:ring-2 focus:ring-accent focus:border-accent shadow-sm transition-all duration-200"
      aria-label="Search games"
    />
  </div>
));

const FilterPanel = React.memo(({ categories, selectedCategory, onCategoryChange, showPublicOnly, onPublicOnlyChange, showUserOnly, onUserOnlyChange }) => (
  <div className={`p-6 rounded-2xl ${glass} border border-accent/10 shadow-md space-y-4`} aria-label="Filters">
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      <div>
        <label className="block text-base font-semibold text-accent mb-2">Category</label>
        <select
          value={selectedCategory}
          onChange={onCategoryChange}
          className="w-full p-3 border-2 border-accent/20 rounded-xl bg-white/90 text-text-dark text-base focus:ring-2 focus:ring-accent focus:border-accent"
          aria-label="Category filter"
        >
          {categories.map((cat) => (
            <option key={cat.value} value={cat.value}>{cat.label}</option>
          ))}
        </select>
      </div>
      <div className="flex items-center">
        <label className="flex items-center space-x-2 cursor-pointer">
          <input
            type="checkbox"
            checked={showPublicOnly}
            onChange={onPublicOnlyChange}
            className="rounded border-accent/30 focus:ring-accent w-5 h-5"
            aria-checked={showPublicOnly}
            aria-label="Show public games only"
          />
          <span className="text-base text-gray-dark font-medium">Public games only</span>
        </label>
      </div>
      <div className="flex items-center">
        <label className="flex items-center space-x-2 cursor-pointer">
          <input
            type="checkbox"
            checked={showUserOnly}
            onChange={onUserOnlyChange}
            className="rounded border-accent/30 focus:ring-accent w-5 h-5"
            aria-checked={showUserOnly}
            aria-label="Show my games only"
          />
          <span className="text-base text-gray-dark font-medium">My games only</span>
        </label>
      </div>
    </div>
  </div>
));



function GameCard({ game, onView, onShare }) {
  const navigate = useNavigate();
  return (
    <div
      className={`relative ${glass} ${cardShadow} border border-accent/10 rounded-2xl p-5 cursor-pointer group transition-all duration-300 min-h-[180px] flex flex-col justify-between`}
      tabIndex={0}
      role="button"
      aria-label={`View game: ${game.title}`}
      onClick={() => navigate(`/chess/pgn/${game.id}`)}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') navigate(`/chess/pgn/${game.id}`); }}
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-bold text-lg text-primary line-clamp-2 group-hover:text-accent transition-colors duration-200">{game.title}</h3>
        <div className="flex space-x-1 ml-2">
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); window.open(`/chess/pgn/${game.id}`, '_blank'); }}
            className="p-2 rounded-full bg-accent/10 text-accent hover:bg-accent/20 hover:text-accent-dark transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            title="View"
            aria-label={`View game: ${game.title}`}
          >
            <EyeIcon className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={onShare}
            className="p-2 rounded-full bg-green-100 text-green-700 hover:bg-green-200 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-green-400"
            title="Share"
            aria-label={`Share game: ${game.title}`}
          >
            <ShareIcon className="w-5 h-5" />
          </button>
        </div>
      </div>
      {game.description && (
        <p className="text-base text-gray-600 mb-2 line-clamp-2 italic">{game.description}</p>
      )}
      <div className="flex flex-wrap gap-2 mb-2">
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
          <TagIcon className="w-4 h-4 mr-1" />
          {game.category}
        </span>
        {game.is_public && (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">Public</span>
        )}
        {game.metadata?.totalGames > 1 && (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-accent/10 text-accent">{game.metadata.totalGames} games</span>
        )}
      </div>
      <div className="flex justify-between items-center text-xs text-gray-500 mt-auto pt-2 border-t border-accent/10">
        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <UserIcon className="w-4 h-4 mr-1" />
            {game.teacher_name || 'Unknown'}
          </div>
          <div className="flex items-center">
            <CalendarIcon className="w-4 h-4 mr-1" />
            {formatDate(game.created_at)}
          </div>
        </div>
        <div className="flex items-center">
          <DocumentIcon className="w-4 h-4 mr-1" />
          {formatFileSize(game.content_size)}
        </div>
      </div>
    </div>
  );
}

const Pagination = React.memo(({ currentPage, totalPages, onPageChange }) => {
  // Calculate visible page numbers
  const pageNumbers = useMemo(() => {
    if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i + 1);
    if (currentPage <= 3) return [1, 2, 3, 4, 5];
    if (currentPage >= totalPages - 2) return [totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    return [currentPage - 2, currentPage - 1, currentPage, currentPage + 1, currentPage + 2];
  }, [currentPage, totalPages]);

  return (
    <nav className="flex flex-wrap justify-center items-center gap-2 mt-4" aria-label="Pagination">
      <button
        type="button"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="p-2 rounded-full border border-accent/20 bg-white/80 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-accent/10 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        aria-label="Previous page"
      >
        <ChevronLeftIcon className="w-5 h-5" />
      </button>
      {pageNumbers.map((page) => (
        <button
          key={page}
          type="button"
          onClick={() => onPageChange(page)}
          className={`px-4 py-2 rounded-full border font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
            page === currentPage
              ? 'bg-accent text-white border-accent shadow-md'
              : 'border-accent/20 bg-white/80 hover:bg-accent/10 text-accent'
          }`}
          aria-current={page === currentPage ? 'page' : undefined}
          aria-label={`Go to page ${page}`}
        >
          {page}
        </button>
      ))}
      <button
        type="button"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="p-2 rounded-full border border-accent/20 bg-white/80 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-accent/10 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        aria-label="Next page"
      >
        <ChevronRightIcon className="w-5 h-5" />
      </button>
    </nav>
  );
});

// --- Main Component ---

export const PGNLibrary = React.memo(function PGNLibrary({ onGameSelect = null, showViewer = true, className = '' }) {
  // --- State ---
  const [games, setGames] = useState([]);
  const [allGames, setAllGames] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedGame, setSelectedGame] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showPublicOnly, setShowPublicOnly] = useState(false);
  const [showUserOnly, setShowUserOnly] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalGames, setTotalGames] = useState(0);
  const gamesPerPage = 12;

  const categories = useMemo(() => [
    { value: '', label: 'All Categories' },
    { value: 'opening', label: 'Opening' },
    { value: 'middlegame', label: 'Middlegame' },
    { value: 'endgame', label: 'Endgame' },
    { value: 'tactics', label: 'Tactics' },
    { value: 'strategy', label: 'Strategy' },
  ], []);

  // Analytics hook
  usePGNView(selectedGame?.id, { enabled: !!selectedGame?.id, delay: 1500 });

  // --- Data Fetching ---
  const loadGames = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = {
        ...(searchTerm && { search: searchTerm }),
        ...(selectedCategory && { category: selectedCategory }),
        ...(showPublicOnly && { public_only: true }),
        ...(showUserOnly && { user_only: true }),
      };
      const response = await ChessApi.getGames(params);
      if (response.success) {
        setAllGames(response.data);
        setTotalGames(response.total || response.data.length);
        setCurrentPage(1);
      } else {
        throw new Error(response.message || 'Failed to load games');
      }
    } catch (err) {
      setError(`Failed to load games: ${err.message}`);
      setAllGames([]);
      setGames([]);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, selectedCategory, showPublicOnly, showUserOnly]);

  const applyPagination = useCallback(() => {
    const totalPages = Math.ceil(allGames.length / gamesPerPage);
    setTotalPages(totalPages);
    const startIndex = (currentPage - 1) * gamesPerPage;
    const endIndex = startIndex + gamesPerPage;
    setGames(allGames.slice(startIndex, endIndex));
  }, [allGames, currentPage, gamesPerPage]);

  useEffect(() => { applyPagination(); }, [applyPagination]);
  useEffect(() => { loadGames(); }, [loadGames]);

  // --- Handlers ---
  const handleSearch = useCallback((e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  }, []);

  const handleCategoryChange = useCallback((e) => {
    setSelectedCategory(e.target.value);
    setCurrentPage(1);
  }, []);

  const handlePublicOnlyChange = useCallback((e) => {
    setShowPublicOnly(e.target.checked);
    if (e.target.checked) setShowUserOnly(false);
    setCurrentPage(1);
  }, []);

  const handleUserOnlyChange = useCallback((e) => {
    setShowUserOnly(e.target.checked);
    if (e.target.checked) setShowPublicOnly(false);
    setCurrentPage(1);
  }, []);

  const handlePageChange = useCallback((page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  }, [totalPages]);

  const loadGameDetails = useCallback(async (gameId) => {
    try {
      const response = await ChessApi.getGame(gameId);
      if (response.success) {
        setSelectedGame(response.data);
        try { await ChessApi.recordPGNView(gameId); } catch {}
        if (onGameSelect) onGameSelect(response.data);
      } else {
        throw new Error(response.message || 'Failed to load game');
      }
    } catch (err) {
      setError(`Failed to load game: ${err.message}`);
    }
  }, [onGameSelect]);

  const handleGameAction = useCallback(async (gameId, action) => {
    switch (action) {
      case 'view':
        await loadGameDetails(gameId);
        break;
      case 'share':
        // TODO: Implement share functionality
        break;
      default:
        break;
    }
  }, [loadGameDetails]);

  // --- Render ---
  return (
    <div className={`pgn-library w-full max-w-full min-h-screen px-1 sm:px-0 ${gradientBg} ${className}`}>
      <div className="flex flex-col w-full gap-8 max-w-6xl mx-auto py-8">
        {/* Games list */}
        <div className="w-full">
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
              <h2 className="text-3xl font-extrabold text-primary tracking-tight drop-shadow-sm">PGN Library</h2>
              <div className="text-base text-accent font-semibold bg-accent/10 px-4 py-2 rounded-xl shadow-sm">{totalGames} game{totalGames !== 1 ? 's' : ''} found</div>
            </div>
            <div className="space-y-4">
              <SearchBar value={searchTerm} onChange={handleSearch} />
              <div className="flex flex-wrap justify-between items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowFilters((v) => !v)}
                  className="flex items-center space-x-2 px-5 py-2 rounded-xl bg-accent/10 text-accent font-semibold hover:bg-accent/20 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent shadow-sm"
                  aria-expanded={showFilters}
                  aria-controls="pgn-filters-panel"
                >
                  <FunnelIcon className="w-6 h-6" />
                  <span>Filters</span>
                </button>
              </div>
              {showFilters && (
                <div id="pgn-filters-panel">
                  <FilterPanel
                    categories={categories}
                    selectedCategory={selectedCategory}
                    onCategoryChange={handleCategoryChange}
                    showPublicOnly={showPublicOnly}
                    onPublicOnlyChange={handlePublicOnlyChange}
                    showUserOnly={showUserOnly}
                    onUserOnlyChange={handleUserOnlyChange}
                  />
                </div>
              )}
            </div>
          </div>
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-800 font-semibold shadow" role="alert">{error}</div>
          )}
          {loading && (
            <div className="flex justify-center items-center py-16" aria-busy="true">
              <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-accent"></div>
            </div>
          )}
          {!loading && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {games.map((game) => (
                  <GameCard
                    key={game.id}
                    game={game}
                    onView={(e) => {
                      if (e) e.stopPropagation();
                      handleGameAction(game.id, 'view');
                    }}
                    onShare={(e) => {
                      if (e) e.stopPropagation();
                      handleGameAction(game.id, 'share');
                    }}
                  />
                ))}
              </div>
              {totalPages > 1 && (
                <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
              )}
              {games.length === 0 && !loading && (
                <div className="text-center py-16">
                  <DocumentIcon className="mx-auto h-16 w-16 text-gray-300 mb-6" aria-hidden="true" />
                  <h3 className="text-2xl font-bold text-text-dark mb-2">No games found</h3>
                  <p className="text-lg text-gray-dark">
                    {searchTerm || selectedCategory || showPublicOnly || showUserOnly
                      ? 'Try adjusting your search criteria or filters.'
                      : 'Upload your first PGN file to get started.'}
                  </p>
                </div>
              )}
            </>
          )}
        </div>
        {/* No viewer panel here, as viewing is now in a new page */}
      </div>
    </div>
  );
});




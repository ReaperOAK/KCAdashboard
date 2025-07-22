import React, { useState, useEffect, useCallback, useMemo } from 'react';
import SearchBar from './pgnlibrary/SearchBar';
import FilterPanel from './pgnlibrary/FilterPanel';
import GameCard from './pgnlibrary/GameCard';
import Pagination from './pgnlibrary/Pagination';
import {
  FunnelIcon,
  DocumentIcon,
} from '@heroicons/react/24/outline';
import { ChessApi } from '../../api/chess';
import usePGNView from '../../hooks/usePGNView';
import { checkPermission, PERMISSIONS } from '../../utils/permissions';

// --- Custom Styles ---
const gradientBg = 'bg-background-light dark:bg-background-dark';


// --- Subcomponents ---

// ...existing code...

// --- Main Component ---

const CATEGORY_CONFIG = {
  student: [
    { id: 'public', label: 'Public Resources' },
  ],
  teacher: [
    { id: 'public', label: 'Public Resources' },
    { id: 'private', label: 'My Private Resources' },
    { id: 'shared', label: 'My Shared Resources' },
  ],
  admin: [
    { id: 'public', label: 'Public Resources' },
    { id: 'coach', label: 'Resources Categorised by Coach' },
  ],
};

export const PGNLibrary = React.memo(function PGNLibrary({ onGameSelect = null, showViewer = true, userRole = 'student', className = '', user = null }) {
  // --- State ---
  const [games, setGames] = useState([]);
  const [allGames, setAllGames] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedGame, setSelectedGame] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  // Resource category selection for role
  const [activeResourceCategory, setActiveResourceCategory] = useState('public');
  // Game category filter (opening, tactics, etc.)
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalGames, setTotalGames] = useState(0);
  const gamesPerPage = 12;

  // Resource categories for current role
  const resourceCategories = useMemo(() => {
    let categories = [];
    
    if (CATEGORY_CONFIG[userRole]) {
      categories = [...CATEGORY_CONFIG[userRole]];
    } else {
      categories = [...CATEGORY_CONFIG.student];
    }
    
    // For admin users, check if they have permission to access coach resources
    if (userRole === 'admin' && user) {
      const hasCoachResourcePermission = user.permissions && 
        checkPermission(user.permissions, PERMISSIONS.CHESS.MANAGE_COACH_RESOURCES);
      
      // If admin doesn't have the specific permission, remove coach resources category
      if (!hasCoachResourcePermission) {
        categories = categories.filter(cat => cat.id !== 'coach');
      }
    }
    
    return categories;
  }, [userRole, user]);

  // Game categories (opening, tactics, etc.)
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
        ...(activeResourceCategory && { resource_category: activeResourceCategory }),
      };
      const response = await ChessApi.getPGNGames(params);
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
  }, [searchTerm, selectedCategory, activeResourceCategory]);

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

  const handleResourceCategoryChange = useCallback((catId) => {
    setActiveResourceCategory(catId);
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

  const [shareMessage, setShareMessage] = useState('');
  const handleGameAction = useCallback(async (gameId, action) => {
    switch (action) {
      case 'view':
        await loadGameDetails(gameId);
        break;
      case 'share': {
        // Share: Copy game URL to clipboard and show confirmation
        const url = `${window.location.origin}/chess/pgn/${gameId}`;
        try {
          await navigator.clipboard.writeText(url);
          setShareMessage('Game link copied to clipboard!');
        } catch (err) {
          setShareMessage('Failed to copy link.');
        }
        setTimeout(() => setShareMessage(''), 2000);
        break;
      }
      default:
        break;
    }
  }, [loadGameDetails]);

  // --- Render ---
  return (
    <section className={`pgn-library w-full max-w-full min-h-screen px-1 sm:px-0 ${gradientBg} ${className}`} aria-label="PGN Library">
      <div className="flex flex-col w-full gap-8 max-w-6xl mx-auto py-8">
        {/* Games list */}
        <section className="w-full">
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
              <h2 className="text-3xl font-extrabold text-primary tracking-tight drop-shadow-sm">PGN Library</h2>
              <div className="text-base text-accent font-semibold bg-accent/10 px-4 py-2 rounded-lg shadow-sm">{totalGames} game{totalGames !== 1 ? 's' : ''} found</div>
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
                    resourceCategories={resourceCategories}
                    activeResourceCategory={activeResourceCategory}
                    onResourceCategoryChange={handleResourceCategoryChange}
                  />
                </div>
              )}
            </div>
          </div>
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-800 font-semibold shadow" role="alert">{error}</div>
          )}
          {shareMessage && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-xl text-green-800 font-semibold shadow" role="status" aria-live="polite">{shareMessage}</div>
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
                  <DocumentIcon className="mx-auto h-16 w-16 text-gray-light mb-6" aria-hidden="true" />
                  <h3 className="text-2xl font-bold text-primary mb-2">No games found</h3>
                  <p className="text-lg text-gray-dark">
                    {searchTerm || selectedCategory || activeResourceCategory !== 'public'
                      ? 'Try adjusting your search criteria or filters.'
                      : 'Upload your first PGN file to get started.'}
                  </p>
                </div>
              )}
            </>
          )}
        </section>
        {/* No viewer panel here, as viewing is now in a new page */}
      </div>
    </section>
  );
});




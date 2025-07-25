import React, { useState, useEffect, useCallback, useMemo } from 'react';
import SearchBar from './pgnlibrary/SearchBar';
import FilterPanel from './pgnlibrary/FilterPanel';
import GameCard from './pgnlibrary/GameCard';
import Pagination from './pgnlibrary/Pagination';
import BatchCreateQuizModal from './pgnlibrary/BatchCreateQuizModal';
import PGNShareModal from './modals/PGNShareModal';
import {
  FunnelIcon,
  DocumentIcon,
  AcademicCapIcon,
  CheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { ChessApi } from '../../api/chess';
import usePGNView from '../../hooks/usePGNView';
import { checkPermission, PERMISSIONS } from '../../utils/permissions';
import { useAuth } from '../../hooks/useAuth';
import toast from 'react-hot-toast';

// --- Custom Styles ---
const gradientBg = 'bg-background-light dark:bg-background-dark';


// --- Subcomponents ---

// ...existing code...

// --- Main Component ---

const CATEGORY_CONFIG = {
  student: [
    { id: 'public', label: 'Public Resources' },
    { id: 'shared-with-me', label: 'Shared with Me' },
  ],
  teacher: [
    { id: 'public', label: 'Public Resources' },
    { id: 'private', label: 'My Private Resources' },
    { id: 'shared', label: 'My Shared Resources' },
    { id: 'shared-with-me', label: 'Shared with Me' },
  ],
  admin: [
    { id: 'public', label: 'Public Resources' },
    { id: 'coach', label: 'Resources Categorised by Coach' },
    { id: 'shared-with-me', label: 'Shared with Me' },
  ],
};

export const PGNLibrary = React.memo(function PGNLibrary({ onGameSelect = null, showViewer = true, userRole = 'student', className = '', user = null }) {
  const { user: authUser } = useAuth();
  const currentUser = user || authUser;
  
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

  // Batch selection state
  const [batchSelectionMode, setBatchSelectionMode] = useState(false);
  const [selectedGames, setSelectedGames] = useState([]);
  const [showBatchQuizModal, setShowBatchQuizModal] = useState(false);

  // Share modal state
  const [showShareModal, setShowShareModal] = useState(false);
  const [gameToShare, setGameToShare] = useState(null);

  const canCreateQuiz = currentUser && (currentUser.role === 'teacher' || currentUser.role === 'admin');

  // Resource categories for current role
  const resourceCategories = useMemo(() => {
    let categories = [];
    
    if (CATEGORY_CONFIG[userRole]) {
      categories = [...CATEGORY_CONFIG[userRole]];
    } else {
      categories = [...CATEGORY_CONFIG.student];
    }
    
    // For admin users, check if they have permission to access coach resources
    if (userRole === 'admin' && currentUser) {
      const hasCoachResourcePermission = currentUser.permissions && 
        checkPermission(currentUser.permissions, PERMISSIONS.CHESS.MANAGE_COACH_RESOURCES);
      
      // If admin doesn't have the specific permission, remove coach resources category
      if (!hasCoachResourcePermission) {
        categories = categories.filter(cat => cat.id !== 'coach');
      }
    }
    
    return categories;
  }, [userRole, currentUser]);

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
      if (activeResourceCategory === 'shared-with-me') {
        // Load shared PGNs for this category
        const response = await ChessApi.getSharedPGNs();
        if (response.success) {
          setAllGames(response.shared_pgns || []);
          setTotalGames(response.total || 0);
          setCurrentPage(1);
        } else {
          throw new Error(response.message || 'Failed to load shared games');
        }
      } else {
        // Load regular PGNs for other categories
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

  const handleGameAction = useCallback(async (gameId, action) => {
    switch (action) {
      case 'view':
        await loadGameDetails(gameId);
        break;
      case 'share': {
        // Find the game to share
        const game = games.find(g => g.id === gameId);
        if (!game) {
          toast.error('Game not found');
          return;
        }
        
        // Check if user can share
        if (!currentUser || (currentUser.role !== 'teacher' && currentUser.role !== 'admin')) {
          toast.error('Only teachers and administrators can share PGN studies');
          return;
        }
        
        // Open share modal
        setGameToShare(game);
        setShowShareModal(true);
        break;
      }
      default:
        break;
    }
  }, [loadGameDetails, games, currentUser]);

  // Batch selection handlers
  const handleToggleBatchMode = useCallback(() => {
    setBatchSelectionMode(!batchSelectionMode);
    setSelectedGames([]);
  }, [batchSelectionMode]);

  const handleSelectGame = useCallback((game) => {
    setSelectedGames(prev => {
      const isSelected = prev.some(g => g.id === game.id);
      if (isSelected) {
        return prev.filter(g => g.id !== game.id);
      } else {
        return [...prev, game];
      }
    });
  }, []);

  const handleSelectAllGames = useCallback(() => {
    setSelectedGames(games);
  }, [games]);

  const handleClearSelection = useCallback(() => {
    setSelectedGames([]);
  }, []);

  const handleCreateBatchQuiz = useCallback(() => {
    if (selectedGames.length === 0) {
      toast.error('Please select at least one game');
      return;
    }
    setShowBatchQuizModal(true);
  }, [selectedGames]);

  const handleCloseBatchModal = useCallback(() => {
    setShowBatchQuizModal(false);
  }, []);

  // Share modal handlers
  const handleCloseShareModal = useCallback(() => {
    setShowShareModal(false);
    setGameToShare(null);
  }, []);

  const handleShareComplete = useCallback((pgnId, userIds, permission) => {
    // Optional: refresh games list or update UI state
    console.log(`PGN ${pgnId} shared with ${userIds.length} users with ${permission} permission`);
  }, []);

  // --- Render ---
  return (
    <section className={`pgn-library w-full max-w-full min-h-screen px-1 sm:px-0 ${gradientBg} ${className}`} aria-label="PGN Library">
      <div className="flex flex-col w-full gap-8 max-w-6xl mx-auto py-8">
        {/* Games list */}
        <section className="w-full">
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
              <h2 className="text-3xl font-extrabold text-primary tracking-tight drop-shadow-sm">PGN Library</h2>
              <div className="flex items-center gap-3">
                <div className="text-base text-accent font-semibold bg-accent/10 px-4 py-2 rounded-lg shadow-sm">
                  {totalGames} game{totalGames !== 1 ? 's' : ''} found
                </div>
                {canCreateQuiz && (
                  <button
                    onClick={handleToggleBatchMode}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                      batchSelectionMode 
                        ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                        : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                    }`}
                  >
                    {batchSelectionMode ? <XMarkIcon className="w-5 h-5" /> : <CheckIcon className="w-5 h-5" />}
                    {batchSelectionMode ? 'Cancel Selection' : 'Batch Select'}
                  </button>
                )}
              </div>
            </div>
            
            {/* Batch Selection Controls */}
            {batchSelectionMode && canCreateQuiz && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-4">
                    <span className="text-blue-800 font-medium">
                      {selectedGames.length} game{selectedGames.length !== 1 ? 's' : ''} selected
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={handleSelectAllGames}
                        className="text-sm text-blue-600 hover:text-blue-800 underline"
                      >
                        Select All ({games.length})
                      </button>
                      <button
                        onClick={handleClearSelection}
                        className="text-sm text-blue-600 hover:text-blue-800 underline"
                      >
                        Clear Selection
                      </button>
                    </div>
                  </div>
                  <button
                    onClick={handleCreateBatchQuiz}
                    disabled={selectedGames.length === 0}
                    className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent-dark transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <AcademicCapIcon className="w-5 h-5" />
                    Create Quiz from {selectedGames.length} Games
                  </button>
                </div>
              </div>
            )}
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
          {loading && (
            <div className="flex justify-center items-center py-16" aria-busy="true">
              <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-accent"></div>
            </div>
          )}
          {!loading && (
            <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {games.map((game) => (
                  <div key={game.id} className="relative">
                    {batchSelectionMode && (
                      <div className="absolute top-2 left-2 z-10">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectGame(game);
                          }}
                          className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                            selectedGames.some(g => g.id === game.id)
                              ? 'bg-accent text-white'
                              : 'bg-white border-2 border-gray-300 hover:border-accent'
                          }`}
                        >
                          {selectedGames.some(g => g.id === game.id) && (
                            <CheckIcon className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                    )}
                    <GameCard
                      game={game}
                      onView={(e) => {
                        if (e) e.stopPropagation();
                        if (batchSelectionMode) {
                          handleSelectGame(game);
                        } else {
                          handleGameAction(game.id, 'view');
                        }
                      }}
                      onShare={(e) => {
                        if (e) e.stopPropagation();
                        handleGameAction(game.id, 'share');
                      }}
                      isSelectable={batchSelectionMode}
                      isSelected={selectedGames.some(g => g.id === game.id)}
                    />
                  </div>
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
        
        {/* Batch Create Quiz Modal */}
        {showBatchQuizModal && (
          <BatchCreateQuizModal
            isOpen={showBatchQuizModal}
            onClose={handleCloseBatchModal}
            selectedGames={selectedGames}
          />
        )}

        {/* PGN Share Modal */}
        {showShareModal && gameToShare && (
          <PGNShareModal
            isOpen={showShareModal}
            onClose={handleCloseShareModal}
            pgn={gameToShare}
            onShareComplete={handleShareComplete}
          />
        )}
      </div>
    </section>
  );
});




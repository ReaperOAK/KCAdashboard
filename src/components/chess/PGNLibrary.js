import React, { useState, useEffect, useCallback } from 'react';
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
import ApiService from '../../utils/api';
import PGNApiService from '../../utils/pgnApi';
import PGNViewer from './PGNViewer';
import usePGNView from '../../hooks/usePGNView';

/**
 * PGN Library/Browser Component
 * Features:
 * - Browse uploaded PGN files
 * - Search and filter games
 * - Pagination
 * - Preview games
 * - Manage permissions
 */
const PGNLibrary = ({ 
  onGameSelect = null,
  showViewer = true,
  className = ''
}) => {
  const [games, setGames] = useState([]);
  const [allGames, setAllGames] = useState([]); // Store all games for client-side pagination
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedGame, setSelectedGame] = useState(null);
  const [selectedGamePGN, setSelectedGamePGN] = useState('');
  
  // Use PGN view tracking hook for analytics
  usePGNView(selectedGame?.id, { 
    enabled: !!selectedGame?.id,
    delay: 1500 // Record view after 1.5 seconds of viewing
  });
  
  // Search and filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showPublicOnly, setShowPublicOnly] = useState(false);
  const [showUserOnly, setShowUserOnly] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalGames, setTotalGames] = useState(0);
  const [gamesPerPage] = useState(12);
  
  const categories = [
    { value: '', label: 'All Categories' },
    { value: 'opening', label: 'Opening' },
    { value: 'middlegame', label: 'Middlegame' },
    { value: 'endgame', label: 'Endgame' },
    { value: 'tactics', label: 'Tactics' },
    { value: 'strategy', label: 'Strategy' }
  ];

  /**
   * Load games from API (no server-side pagination)
   */
  const loadGames = useCallback(async () => {
    setLoading(true);
    setError('');
    
    try {
      const params = {
        ...(searchTerm && { search: searchTerm }),
        ...(selectedCategory && { category: selectedCategory }),
        ...(showPublicOnly && { public_only: true }),
        ...(showUserOnly && { user_only: true })
      };
      
      const response = await ApiService.request('/chess/get-games.php', 'GET', null, { params });
      
      if (response.success) {
        setAllGames(response.data);
        setTotalGames(response.total || response.data.length);
        // Reset to first page when filters change
        setCurrentPage(1);
      } else {
        throw new Error(response.message || 'Failed to load games');
      }
    } catch (err) {
      console.error('Load games error:', err);
      setError(`Failed to load games: ${err.message}`);
      setAllGames([]);
      setGames([]);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, selectedCategory, showPublicOnly, showUserOnly]);

  /**
   * Apply client-side pagination to all games
   */
  const applyPagination = useCallback(() => {
    const totalPages = Math.ceil(allGames.length / gamesPerPage);
    setTotalPages(totalPages);
    
    const startIndex = (currentPage - 1) * gamesPerPage;
    const endIndex = startIndex + gamesPerPage;
    const paginatedGames = allGames.slice(startIndex, endIndex);
    
    setGames(paginatedGames);
  }, [allGames, currentPage, gamesPerPage]);

  // Apply pagination when allGames or currentPage changes
  useEffect(() => {
    applyPagination();
  }, [applyPagination]);

  // Load games when filters change
  useEffect(() => {
    loadGames();
  }, [loadGames]);

  /**
   * Load specific game details
   */
  const loadGameDetails = useCallback(async (gameId) => {
    try {
      const response = await ApiService.request(`/chess/get-game.php?id=${gameId}`, 'GET');
      
      if (response.success) {
        setSelectedGame(response.data);
        setSelectedGamePGN(response.data.pgn_content);
        
        // Record view for analytics (non-blocking)
        try {
          await PGNApiService.recordView(gameId);
        } catch (viewError) {
          console.warn('Failed to record view:', viewError);
          // Don't break the game loading flow
        }
        
        if (onGameSelect) {
          onGameSelect(response.data);
        }
      } else {
        throw new Error(response.message || 'Failed to load game');
      }
    } catch (err) {
      console.error('Load game details error:', err);
      setError(`Failed to load game: ${err.message}`);
    }
  }, [onGameSelect]);

  /**
   * Handle search
   */
  const handleSearch = useCallback((term) => {
    setSearchTerm(term);
    setCurrentPage(1);
  }, []);

  /**
   * Handle filter changes
   */
  const handleCategoryChange = useCallback((category) => {
    setSelectedCategory(category);
    setCurrentPage(1);
  }, []);

  const handlePublicOnlyChange = useCallback((checked) => {
    setShowPublicOnly(checked);
    if (checked) setShowUserOnly(false);
    setCurrentPage(1);
  }, []);

  const handleUserOnlyChange = useCallback((checked) => {
    setShowUserOnly(checked);
    if (checked) setShowPublicOnly(false);
    setCurrentPage(1);
  }, []);

  /**
   * Handle pagination
   */
  const handlePageChange = useCallback((page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  }, [totalPages]);

  /**
   * Handle game actions
   */
  const handleGameAction = useCallback(async (gameId, action) => {
    switch (action) {
      case 'view':
        await loadGameDetails(gameId);
        break;
      case 'edit':
        // TODO: Implement edit functionality
        console.log('Edit game:', gameId);
        break;
      case 'delete':
        // TODO: Implement delete functionality
        if (window.confirm('Are you sure you want to delete this game?')) {
          console.log('Delete game:', gameId);
        }
        break;
      case 'share':
        // TODO: Implement share functionality
        console.log('Share game:', gameId);
        break;
      default:
        console.warn('Unknown action:', action);
    }
  }, [loadGameDetails]);

  /**
   * Format file size
   */
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  /**
   * Format date
   */
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Effects are handled above in the loadGames function

  return (
    <div className={`pgn-library ${className}`}>
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Games list */}
        <div className="xl:col-span-2">
          {/* Header */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              PGN Library
            </h2>
            
            {/* Search and filters */}
            <div className="space-y-4">
              {/* Search bar */}
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search games by title or description..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              {/* Filter toggle */}
              <div className="flex justify-between items-center">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center space-x-2 px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                >
                  <FunnelIcon className="w-5 h-5" />
                  <span>Filters</span>
                </button>
                
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {totalGames} game{totalGames !== 1 ? 's' : ''} found
                </div>
              </div>
              
              {/* Filters */}
              {showFilters && (
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Category filter */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Category
                      </label>
                      <select
                        value={selectedCategory}
                        onChange={(e) => handleCategoryChange(e.target.value)}
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      >
                        {categories.map(cat => (
                          <option key={cat.value} value={cat.value}>
                            {cat.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    {/* Public only filter */}
                    <div>
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={showPublicOnly}
                          onChange={(e) => handlePublicOnlyChange(e.target.checked)}
                          className="rounded border-gray-300 dark:border-gray-600"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          Public games only
                        </span>
                      </label>
                    </div>
                    
                    {/* User only filter */}
                    <div>
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={showUserOnly}
                          onChange={(e) => handleUserOnlyChange(e.target.checked)}
                          className="rounded border-gray-300 dark:border-gray-600"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          My games only
                        </span>
                      </label>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Error message */}
          {error && (
            <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-800 dark:text-red-200">
              {error}
            </div>
          )}

          {/* Loading state */}
          {loading && (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          )}

          {/* Games grid */}
          {!loading && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {games.map((game) => (
                  <div
                    key={game.id}
                    className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => handleGameAction(game.id, 'view')}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-2">
                        {game.title}
                      </h3>
                      <div className="flex space-x-1 ml-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleGameAction(game.id, 'view');
                          }}
                          className="p-1 text-gray-400 hover:text-blue-500 transition-colors"
                          title="View"
                        >
                          <EyeIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleGameAction(game.id, 'share');
                          }}
                          className="p-1 text-gray-400 hover:text-green-500 transition-colors"
                          title="Share"
                        >
                          <ShareIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    
                    {game.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                        {game.description}
                      </p>
                    )}
                    
                    <div className="flex flex-wrap gap-2 mb-3">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200">
                        <TagIcon className="w-3 h-3 mr-1" />
                        {game.category}
                      </span>
                      {game.is_public && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200">
                          Public
                        </span>
                      )}
                      {game.metadata?.totalGames > 1 && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200">
                          {game.metadata.totalGames} games
                        </span>
                      )}
                    </div>
                    
                    <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center">
                          <UserIcon className="w-3 h-3 mr-1" />
                          {game.teacher_name || 'Unknown'}
                        </div>
                        <div className="flex items-center">
                          <CalendarIcon className="w-3 h-3 mr-1" />
                          {formatDate(game.created_at)}
                        </div>
                      </div>
                      <div className="flex items-center">
                        <DocumentIcon className="w-3 h-3 mr-1" />
                        {formatFileSize(game.content_size)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center space-x-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="p-2 rounded border border-gray-300 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <ChevronLeftIcon className="w-4 h-4" />
                  </button>
                  
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let page;
                    if (totalPages <= 5) {
                      page = i + 1;
                    } else if (currentPage <= 3) {
                      page = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      page = totalPages - 4 + i;
                    } else {
                      page = currentPage - 2 + i;
                    }
                    
                    return (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`px-3 py-2 rounded border transition-colors ${
                          page === currentPage
                            ? 'bg-blue-500 text-white border-blue-500'
                            : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}
                  
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded border border-gray-300 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <ChevronRightIcon className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Empty state */}
              {games.length === 0 && !loading && (
                <div className="text-center py-12">
                  <DocumentIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No games found
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {searchTerm || selectedCategory || showPublicOnly || showUserOnly
                      ? 'Try adjusting your search criteria or filters.'
                      : 'Upload your first PGN file to get started.'}
                  </p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Game viewer */}
        {showViewer && selectedGamePGN && (
          <div className="xl:col-span-1">
            <div className="sticky top-4">
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    Game Viewer
                  </h3>
                  <button
                    onClick={() => {
                      setSelectedGame(null);
                      setSelectedGamePGN('');
                    }}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    ×
                  </button>
                </div>
                
                {selectedGame && (
                  <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
                    <div className="font-medium text-gray-900 dark:text-white">
                      {selectedGame.title}
                    </div>
                    {selectedGame.description && (
                      <div className="mt-1">{selectedGame.description}</div>
                    )}
                  </div>
                )}
                
                {/* PGN Download Button */}
                {selectedGamePGN && (
                  <div className="mb-4 flex justify-end">
                    <button
                      className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors font-semibold"
                      onClick={() => {
                        const blob = new Blob([selectedGamePGN], { type: 'text/plain' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `game-${selectedGame?.id || 'pgn'}.pgn`;
                        document.body.appendChild(a);
                        a.click();
                        setTimeout(() => {
                          document.body.removeChild(a);
                          URL.revokeObjectURL(url);
                        }, 100);
                      }}
                    >
                      Download PGN
                    </button>
                  </div>
                )}
                <PGNViewer
                  initialPgn={selectedGamePGN}
                  width={300}
                  height={300}
                  showControls={true}
                  showHeaders={true}
                  showMoveList={true}
                  theme="light"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PGNLibrary;

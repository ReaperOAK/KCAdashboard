import ApiService from './api';

/**
 * PGN API Service
 * Centralized API calls for PGN functionality
 */
class PGNApiService extends ApiService {
  
  /**
   * Upload a PGN file or text content
   * @param {Object} pgnData - The PGN data to upload
   * @param {string} pgnData.title - Title for the PGN
   * @param {string} pgnData.pgn_content - The PGN content
   * @param {string} pgnData.description - Optional description
   * @param {string} pgnData.category - Category (opening, middlegame, endgame, tactics, strategy)
   * @param {boolean} pgnData.is_public - Whether the PGN should be public
   * @param {Object} pgnData.metadata - Optional metadata from parsing
   * @returns {Promise<Object>} Upload result
   */
  static async uploadPGN(pgnData) {
    try {
      const response = await this.request('/chess/upload-pgn.php', 'POST', pgnData);
      return response;
    } catch (error) {
      console.error('Error uploading PGN:', error);
      throw error;
    }
  }

  /**
   * Get list of PGN games with filtering and pagination
   * @param {Object} options - Filter and pagination options
   * @param {number} options.page - Page number (default: 1)
   * @param {number} options.limit - Items per page (default: 20)
   * @param {string} options.category - Filter by category
   * @param {string} options.search - Search term
   * @param {boolean} options.public_only - Show only public games
   * @param {boolean} options.user_only - Show only current user's games
   * @returns {Promise<Object>} List of games with pagination info
   */
  static async getGames(options = {}) {
    try {
      const params = {
        page: options.page || 1,
        limit: options.limit || 20,
        ...options
      };
      
      const response = await this.request('/chess/get-games.php', 'GET', null, { params });
      return response;
    } catch (error) {
      console.error('Error fetching games:', error);
      throw error;
    }
  }

  /**
   * Get a specific PGN game by ID
   * @param {number} gameId - The game ID
   * @returns {Promise<Object>} Game data including PGN content
   */
  static async getGame(gameId) {
    try {
      const response = await this.request(`/chess/get-game.php?id=${gameId}`, 'GET');
      return response;
    } catch (error) {
      console.error('Error fetching game:', error);
      throw error;
    }
  }

  /**
   * Update a PGN game
   * @param {number} gameId - The game ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object>} Update result
   */
  static async updateGame(gameId, updateData) {
    try {
      const response = await this.request(`/chess/update-pgn.php?id=${gameId}`, 'PUT', updateData);
      return response;
    } catch (error) {
      console.error('Error updating game:', error);
      throw error;
    }
  }

  /**
   * Delete a PGN game
   * @param {number} gameId - The game ID
   * @returns {Promise<Object>} Delete result
   */
  static async deleteGame(gameId) {
    try {
      const response = await this.request(`/chess/delete-pgn.php?id=${gameId}`, 'DELETE');
      return response;
    } catch (error) {
      console.error('Error deleting game:', error);
      throw error;
    }
  }

  /**
   * Add a game to favorites
   * @param {number} gameId - The game ID
   * @returns {Promise<Object>} Favorite result
   */
  static async addToFavorites(gameId) {
    try {
      const response = await this.request('/chess/favorite-pgn.php', 'POST', { pgn_id: gameId });
      return response;
    } catch (error) {
      console.error('Error adding to favorites:', error);
      throw error;
    }
  }

  /**
   * Remove a game from favorites
   * @param {number} gameId - The game ID
   * @returns {Promise<Object>} Unfavorite result
   */
  static async removeFromFavorites(gameId) {
    try {
      const response = await this.request(`/chess/favorite-pgn.php?id=${gameId}`, 'DELETE');
      return response;
    } catch (error) {
      console.error('Error removing from favorites:', error);
      throw error;
    }
  }

  /**
   * Get user's favorite games
   * @param {Object} options - Pagination options
   * @returns {Promise<Object>} List of favorite games
   */
  static async getFavorites(options = {}) {
    try {
      const params = {
        page: options.page || 1,
        limit: options.limit || 20,
        favorites_only: true
      };
      
      const response = await this.request('/chess/get-games.php', 'GET', null, { params });
      return response;
    } catch (error) {
      console.error('Error fetching favorites:', error);
      throw error;
    }
  }

  /**
   * Record a game view for analytics
   * @param {number} gameId - The game ID
   * @returns {Promise<Object>} View record result
   */
  static async recordView(gameId) {
    try {
      const response = await this.request('/chess/record-view.php', 'POST', { 
        pgn_id: gameId,
        timestamp: new Date().toISOString()
      });
      return response;
    } catch (error) {
      console.error('Error recording view:', error);
      // Don't throw error for analytics - it's not critical
      return null;
    }
  }

  /**
   * Add annotation to a game
   * @param {number} gameId - The game ID
   * @param {number} moveNumber - Move number for the annotation
   * @param {string} annotationText - The annotation text
   * @param {string} annotationType - Type: 'comment', 'variation', 'evaluation'
   * @param {boolean} isPublic - Whether annotation is public
   * @returns {Promise<Object>} Annotation result
   */
  static async addAnnotation(gameId, moveNumber, annotationText, annotationType = 'comment', isPublic = false) {
    try {
      const response = await this.request('/chess/add-annotation.php', 'POST', {
        pgn_id: gameId,
        move_number: moveNumber,
        annotation_text: annotationText,
        annotation_type: annotationType,
        is_public: isPublic
      });
      return response;
    } catch (error) {
      console.error('Error adding annotation:', error);
      throw error;
    }
  }

  /**
   * Get annotations for a game
   * @param {number} gameId - The game ID
   * @param {number} userId - Optional user ID to get user-specific annotations
   * @returns {Promise<Object>} Game annotations
   */
  static async getAnnotations(gameId, userId = null) {
    try {
      const params = { pgn_id: gameId };
      if (userId) params.user_id = userId;
      
      const response = await this.request('/chess/get-annotations.php', 'GET', null, { params });
      return response;
    } catch (error) {
      console.error('Error fetching annotations:', error);
      throw error;
    }
  }

  /**
   * Get PGN categories
   * @returns {Promise<Object>} List of categories
   */
  static async getCategories() {
    try {
      const response = await this.request('/chess/get-categories.php', 'GET');
      return response;
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  }

  /**
   * Get user preferences for PGN viewer
   * @returns {Promise<Object>} User preferences
   */
  static async getUserPreferences() {
    try {
      const response = await this.request('/chess/get-preferences.php', 'GET');
      return response;
    } catch (error) {
      console.error('Error fetching user preferences:', error);
      // Return default preferences if API fails
      return {
        success: true,
        data: {
          board_theme: 'classic',
          piece_set: 'classic',
          board_orientation: 'white',
          show_coordinates: true,
          show_move_highlights: true,
          auto_play_delay: 1500,
          preferred_notation: 'san',
          show_variations: true,
          show_comments: true,
          show_nags: true,
          dark_theme: false
        }
      };
    }
  }

  /**
   * Update user preferences
   * @param {Object} preferences - Updated preferences
   * @returns {Promise<Object>} Update result
   */
  static async updateUserPreferences(preferences) {
    try {
      const response = await this.request('/chess/update-preferences.php', 'POST', preferences);
      return response;
    } catch (error) {
      console.error('Error updating preferences:', error);
      throw error;
    }
  }

  /**
   * Share a PGN game with other users
   * @param {number} gameId - The game ID
   * @param {Array} userIds - Array of user IDs to share with
   * @param {string} permission - 'view' or 'edit'
   * @returns {Promise<Object>} Share result
   */
  static async shareGame(gameId, userIds, permission = 'view') {
    try {
      const response = await this.request('/chess/share-pgn.php', 'POST', {
        pgn_id: gameId,
        user_ids: userIds,
        permission: permission
      });
      return response;
    } catch (error) {
      console.error('Error sharing game:', error);
      throw error;
    }
  }

  /**
   * Get popular/trending games
   * @param {Object} options - Filter options
   * @returns {Promise<Object>} Popular games
   */
  static async getPopularGames(options = {}) {
    try {
      const params = {
        page: options.page || 1,
        limit: options.limit || 20,
        sort: 'popular',
        public_only: true
      };
      
      const response = await this.request('/chess/get-games.php', 'GET', null, { params });
      return response;
    } catch (error) {
      console.error('Error fetching popular games:', error);
      throw error;
    }
  }

  /**
   * Search games with advanced filters
   * @param {Object} searchOptions - Advanced search options
   * @param {string} searchOptions.query - Search query
   * @param {string} searchOptions.white_player - White player name
   * @param {string} searchOptions.black_player - Black player name
   * @param {string} searchOptions.event - Event name
   * @param {string} searchOptions.site - Site/location
   * @param {string} searchOptions.date_from - Date from (YYYY-MM-DD)
   * @param {string} searchOptions.date_to - Date to (YYYY-MM-DD)
   * @param {string} searchOptions.result - Game result (1-0, 0-1, 1/2-1/2)
   * @param {string} searchOptions.eco - ECO code
   * @returns {Promise<Object>} Search results
   */
  static async advancedSearch(searchOptions) {
    try {
      const response = await this.request('/chess/advanced-search.php', 'POST', searchOptions);
      return response;
    } catch (error) {
      console.error('Error performing advanced search:', error);
      throw error;
    }
  }

  /**
   * Get game statistics and analytics
   * @param {number} gameId - Optional game ID for specific game stats
   * @returns {Promise<Object>} Game statistics
   */
  static async getGameStats(gameId = null) {
    try {
      const params = gameId ? { pgn_id: gameId } : {};
      const response = await this.request('/chess/get-stats.php', 'GET', null, { params });
      return response;
    } catch (error) {
      console.error('Error fetching game stats:', error);
      throw error;
    }
  }

  /**
   * Export games in various formats
   * @param {Array} gameIds - Array of game IDs to export
   * @param {string} format - Export format ('pgn', 'pdf', 'json')
   * @returns {Promise<Blob>} Export file blob
   */
  static async exportGames(gameIds, format = 'pgn') {
    try {
      const response = await fetch(`${this.API_URL}/chess/export-games.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          game_ids: gameIds,
          format: format
        })
      });

      if (!response.ok) {
        throw new Error('Export failed');
      }

      return await response.blob();
    } catch (error) {
      console.error('Error exporting games:', error);
      throw error;
    }
  }

  /**
   * Validate PGN content before upload
   * @param {string} pgnContent - PGN content to validate
   * @returns {Promise<Object>} Validation result
   */
  static async validatePGN(pgnContent) {
    try {
      const response = await this.request('/chess/validate-pgn.php', 'POST', {
        pgn_content: pgnContent
      });
      return response;
    } catch (error) {
      console.error('Error validating PGN:', error);
      throw error;
    }
  }
}

export default PGNApiService;

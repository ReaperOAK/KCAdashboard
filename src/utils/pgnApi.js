
import ApiService from './api';

// PGN API Service: Centralized API calls for PGN functionality
// All methods are static for direct usage; no state or side effects.

export class PGNApiService extends ApiService {
  // Upload a PGN file or text content
  static async uploadPGN(pgnData) {
    try {
      return await this.request('/chess/upload-pgn.php', 'POST', pgnData);
    } catch (error) {
      console.error('Error uploading PGN:', error);
      throw error;
    }
  }

  // Get list of PGN games with filtering and pagination
  static async getGames(options = {}) {
    try {
      const params = { page: options.page || 1, limit: options.limit || 20, ...options };
      return await this.request('/chess/get-games.php', 'GET', null, { params });
    } catch (error) {
      console.error('Error fetching games:', error);
      throw error;
    }
  }

  // Get a specific PGN game by ID
  static async getGame(gameId) {
    try {
      return await this.request(`/chess/get-game.php?id=${gameId}`, 'GET');
    } catch (error) {
      console.error('Error fetching game:', error);
      throw error;
    }
  }

  // Update a PGN game
  static async updateGame(gameId, updateData) {
    try {
      return await this.request(`/chess/update-pgn.php?id=${gameId}`, 'PUT', updateData);
    } catch (error) {
      console.error('Error updating game:', error);
      throw error;
    }
  }

  // Delete a PGN game
  static async deleteGame(gameId) {
    try {
      return await this.request(`/chess/delete-pgn.php?id=${gameId}`, 'DELETE');
    } catch (error) {
      console.error('Error deleting game:', error);
      throw error;
    }
  }

  // Add a game to favorites
  static async addToFavorites(gameId) {
    try {
      return await this.request('/chess/favorite-pgn.php', 'POST', { pgn_id: gameId });
    } catch (error) {
      console.error('Error adding to favorites:', error);
      throw error;
    }
  }

  // Remove a game from favorites
  static async removeFromFavorites(gameId) {
    try {
      return await this.request(`/chess/favorite-pgn.php?id=${gameId}`, 'DELETE');
    } catch (error) {
      console.error('Error removing from favorites:', error);
      throw error;
    }
  }

  // Get user's favorite games
  static async getFavorites(options = {}) {
    try {
      const params = { page: options.page || 1, limit: options.limit || 20, favorites_only: true };
      return await this.request('/chess/get-games.php', 'GET', null, { params });
    } catch (error) {
      console.error('Error fetching favorites:', error);
      throw error;
    }
  }

  // Record a game view for analytics (non-critical, do not throw)
  static async recordView(gameId) {
    try {
      return await this.request('/chess/record-view.php', 'POST', {
        pgn_id: gameId,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error recording view:', error);
      return null;
    }
  }

  // Add annotation to a game
  static async addAnnotation(gameId, moveNumber, annotationText, annotationType = 'comment', isPublic = false) {
    try {
      return await this.request('/chess/add-annotation.php', 'POST', {
        pgn_id: gameId,
        move_number: moveNumber,
        annotation_text: annotationText,
        annotation_type: annotationType,
        is_public: isPublic,
      });
    } catch (error) {
      console.error('Error adding annotation:', error);
      throw error;
    }
  }

  // Get annotations for a game
  static async getAnnotations(gameId, userId = null) {
    try {
      const params = { pgn_id: gameId };
      if (userId) params.user_id = userId;
      return await this.request('/chess/get-annotations.php', 'GET', null, { params });
    } catch (error) {
      console.error('Error fetching annotations:', error);
      throw error;
    }
  }

  // Get PGN categories
  static async getCategories() {
    try {
      return await this.request('/chess/get-categories.php', 'GET');
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  }

  // Get user preferences for PGN viewer
  static async getUserPreferences() {
    try {
      return await this.request('/chess/get-preferences.php', 'GET');
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
          dark_theme: false,
        },
      };
    }
  }

  // Update user preferences
  static async updateUserPreferences(preferences) {
    try {
      return await this.request('/chess/update-preferences.php', 'POST', preferences);
    } catch (error) {
      console.error('Error updating preferences:', error);
      throw error;
    }
  }

  // Share a PGN game with other users
  static async shareGame(gameId, userIds, permission = 'view') {
    try {
      return await this.request('/chess/share-pgn.php', 'POST', {
        pgn_id: gameId,
        user_ids: userIds,
        permission,
      });
    } catch (error) {
      console.error('Error sharing game:', error);
      throw error;
    }
  }

  // Get popular/trending games
  static async getPopularGames(options = {}) {
    try {
      const params = { page: options.page || 1, limit: options.limit || 20, sort: 'popular', public_only: true };
      return await this.request('/chess/get-games.php', 'GET', null, { params });
    } catch (error) {
      console.error('Error fetching popular games:', error);
      throw error;
    }
  }

  // Search games with advanced filters
  static async advancedSearch(searchOptions) {
    try {
      return await this.request('/chess/advanced-search.php', 'POST', searchOptions);
    } catch (error) {
      console.error('Error performing advanced search:', error);
      throw error;
    }
  }

  // Get game statistics and analytics
  static async getGameStats(gameId = null) {
    try {
      const params = gameId ? { pgn_id: gameId } : {};
      return await this.request('/chess/get-stats.php', 'GET', null, { params });
    } catch (error) {
      console.error('Error fetching game stats:', error);
      throw error;
    }
  }

  // Export games in various formats
  static async exportGames(gameIds, format = 'pgn') {
    try {
      return await this.request('/chess/export-games.php', 'POST', { game_ids: gameIds, format }, { responseType: 'blob' });
    } catch (error) {
      console.error('Error exporting games:', error);
      throw error;
    }
  }

  // Validate PGN content before upload
  static async validatePGN(pgnContent) {
    try {
      return await this.request('/chess/validate-pgn.php', 'POST', { pgn_content: pgnContent });
    } catch (error) {
      console.error('Error validating PGN:', error);
      throw error;
    }
  }
}

export default PGNApiService;

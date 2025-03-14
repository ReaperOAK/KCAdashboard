/**
 * Lichess API Integration Utility
 * Based on Lichess API v2.0.0 - https://lichess.org/api
 */

import ApiService from './api';

class LichessApi {
  constructor() {
    this.baseUrl = 'https://lichess.org/api';
  }

  /**
   * Make a request to the Lichess API
   * @param {string} endpoint - API endpoint
   * @param {Object} options - Request options
   * @returns {Promise} - API response
   */
  async request(endpoint, options = {}) {
    try {
      // Default options
      const defaultOptions = {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      };

      // Special handling for ndjson endpoints
      if (options.ndjson) {
        defaultOptions.headers['Accept'] = 'application/x-ndjson';
      }

      // Merge options
      const mergedOptions = {
        ...defaultOptions,
        ...options,
        headers: {
          ...defaultOptions.headers,
          ...(options.headers || {})
        }
      };

      // Get Lichess auth token if available
      const lichessToken = await this.getLichessToken();
      if (lichessToken) {
        mergedOptions.headers['Authorization'] = `Bearer ${lichessToken}`;
      }

      let url = `${this.baseUrl}${endpoint}`;
      if (options.params) {
        const queryParams = new URLSearchParams(options.params).toString();
        url = `${url}${url.includes('?') ? '&' : '?'}${queryParams}`;
      }

      const response = await fetch(url, mergedOptions);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Lichess API error (${response.status}): ${errorText}`);
      }

      // Handle ndjson responses
      if (options.ndjson) {
        return this.processNdjson(response);
      }

      // Handle regular JSON responses
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return response.json();
      }
      
      return response.text();

    } catch (error) {
      console.error('Lichess API error:', error);
      throw error;
    }
  }

  /**
   * Process ndjson response by splitting into lines and parsing each line as JSON
   * @param {Response} response - Fetch response object
   * @returns {Promise<Array>} - Parsed JSON objects
   */
  async processNdjson(response) {
    const text = await response.text();
    const lines = text.trim().split('\n');
    return lines
      .filter(line => line.trim() !== '')
      .map(line => {
        try {
          return JSON.parse(line);
        } catch (e) {
          console.error('Error parsing ndjson line:', line, e);
          return null;
        }
      })
      .filter(Boolean);
  }

  /**
   * Get Lichess auth token from our backend
   * @returns {Promise<string|null>} - Lichess auth token
   */
  async getLichessToken() {
    try {
      const response = await ApiService.get('/user/lichess-token.php');
      return response.token || null;
    } catch (error) {
      console.warn('Failed to get Lichess token:', error);
      return null;
    }
  }

  /**
   * Connect a user's Lichess account
   * @param {string} code - OAuth authorization code
   * @returns {Promise} - API response
   */
  connectLichessAccount(code) {
    return ApiService.post('/user/connect-lichess.php', { code });
  }

  /**
   * Get daily puzzle from Lichess
   * @returns {Promise} - Puzzle data
   */
  getDailyPuzzle() {
    return this.request('/puzzle/daily');
  }

  /**
   * Get specific puzzle by ID
   * @param {string} puzzleId - Puzzle ID
   * @returns {Promise} - Puzzle data
   */
  getPuzzleById(puzzleId) {
    return this.request(`/puzzle/${puzzleId}`);
  }

  /**
   * Get a user's games from Lichess
   * @param {string} username - Lichess username
   * @param {Object} options - Query parameters
   * @returns {Promise<Array>} - Games data
   */
  async getGames(username, options = {}) {
    return this.request(`/games/user/${username}`, {
      ndjson: true,
      params: options
    });
  }

  /**
   * Get ongoing games for current user
   * @returns {Promise<Array>} - Games data
   */
  async getOngoingGames() {
    return this.request('/account/playing', {
      ndjson: true
    });
  }

  /**
   * Get studies by username
   * @param {string} username - Lichess username
   * @returns {Promise<Array>} - Studies data
   */
  async getStudies(username) {
    return this.request(`/study/by/${username}`, {
      ndjson: true
    });
  }

  /**
   * Get active simul games
   * @returns {Promise} - Simul data
   */
  getSimuls() {
    return this.request('/simul');
  }

  /**
   * Get TV channels
   * @returns {Promise} - TV channels data
   */
  getTvChannels() {
    return this.request('/tv/channels');
  }

  /**
   * Get current TV game for a channel
   * @param {string} channel - Channel name
   * @returns {Promise} - Game data
   */
  getTvGameByChannel(channel) {
    return this.request(`/tv/${channel}`);
  }

  /**
   * Import a game from PGN
   * @param {string} pgn - PGN string
   * @returns {Promise} - Imported game data
   */
  importGame(pgn) {
    return this.request('/import', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        pgn
      }).toString()
    });
  }

  /**
   * Access a specific study or chapter
   * @param {string} studyId - Study ID
   * @param {string} chapterId - Chapter ID (optional)
   * @returns {Promise<string>} - PGN data
   */
  getStudyPgn(studyId, chapterId = null) {
    const endpoint = chapterId 
      ? `/study/${studyId}/${chapterId}.pgn`
      : `/study/${studyId}.pgn`;
    
    return this.request(endpoint);
  }

  /**
   * Get user status (online, playing, streaming)
   * @param {Array<string>} usernames - List of usernames
   * @returns {Promise<Array>} - Users status data
   */
  getUsersStatus(usernames) {
    if (!Array.isArray(usernames) || !usernames.length) {
      return Promise.resolve([]);
    }
    
    return this.request('/users/status', {
      params: {
        ids: usernames.join(',')
      }
    });
  }
  
  /**
   * Get user profile data
   * @param {string} username - Lichess username
   * @returns {Promise} - User profile data
   */
  getUserProfile(username) {
    return this.request(`/user/${username}`);
  }
}

export default new LichessApi();

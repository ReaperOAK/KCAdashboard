// Chess/game endpoints
import { get, post, put ,del } from './utils';

export const ChessApi = {
  getMoveHistory: (gameId) => get(`/chess/get-move-history.php?id=${gameId}`),
  getChessGames: (status = 'all') => get(`/chess/games.php?status=${status}`),
  savePGN: (gameId, pgn) => post('/chess/save-pgn.php', { game_id: gameId, pgn }),
  getGameDetails: (id) => get(`/chess/game.php?id=${id}`),
  makeGameMove: (gameId, move, fen) => post('/chess/make-move.php', { game_id: gameId, move, fen }),
  challengePlayer: (userId, gameSettings) => post('/chess/challenge.php', { opponent_id: userId, ...gameSettings }),
  respondToChallenge: (challengeId, accept) => post('/chess/respond-challenge.php', { challenge_id: challengeId, accept }),
  getOnlinePlayers: () => get('/chess/online-players.php'),
  resignGame: (gameId) => post('/chess/resign-game.php', { game_id: gameId }),
  getPracticePositions: (type = 'all') => get(`/chess/practice-positions.php?type=${type}`),
  createPracticePosition: (positionData) => post('/chess/create-practice.php', positionData),
  getEngineEvaluation: (fen, depth = 15) => post('/chess/engine-analysis.php', { fen, depth }),
  saveGameResult: (gameId, result) => post('/chess/save-result.php', { game_id: gameId, result }),
  getPlayerStats: () => get('/chess/player-stats.php'),
  getChallenges: () => get('/chess/challenges.php'),

  // Draw offer endpoints
  offerDraw: (gameId) => post('/chess/offer-draw.php', { game_id: gameId }).catch(error => {
    if (error.message?.includes('404') || error.message?.includes('not found')) {
      return { success: false, message: 'Draw offers not available' };
    }
    throw error;
  }),
  respondToDraw: (gameId, response) => post('/chess/respond-draw.php', { game_id: gameId, response }).catch(error => {
    if (error.message?.includes('404') || error.message?.includes('not found')) {
      return { success: false, message: 'Draw offers not available' };
    }
    throw error;
  }),
  getDrawOffers: (gameId) => get(`/chess/get-draw-offers.php?game_id=${gameId}`).catch(error => {
    if (error.message?.includes('404') || error.message?.includes('not found')) {
      return { success: false, offers: [] };
    }
    throw error;
  }),

  // Record a PGN view for analytics
  recordPGNView: (gameId) => post('/chess/record-view.php', {
    pgn_id: gameId,
    timestamp: new Date().toISOString(),
  }),

  // Get a PGN game by ID
  getPGNGame: (id) => get(`/chess/get-game.php?id=${id}`),

  // Upload a PGN file or text content
  uploadPGN: (data) => post('/chess/upload-pgn.php', data),

  // PGN management endpoints (from PGNApiService)
  getPGNGames: (options = {}) => {
    const params = { page: options.page || 1, limit: options.limit || 20, ...options };
    return get('/chess/get-games.php', { params });
  },
  updatePGN: (gameId, updateData) => put(`/chess/update-pgn.php?id=${gameId}`, updateData),
  deletePGN: (gameId) => del(`/chess/delete-pgn.php?id=${gameId}`),
  addToFavorites: (gameId) => post('/chess/favorite-pgn.php', { pgn_id: gameId }),
  removeFromFavorites: (gameId) => del(`/chess/favorite-pgn.php?id=${gameId}`),
  getFavorites: (options = {}) => {
    const params = { page: options.page || 1, limit: options.limit || 20, favorites_only: true };
    return get('/chess/get-games.php', { params });
  },
  addAnnotation: (gameId, moveNumber, annotationText, annotationType = 'comment', isPublic = false) =>
    post('/chess/add-annotation.php', {
      pgn_id: gameId,
      move_number: moveNumber,
      annotation_text: annotationText,
      annotation_type: annotationType,
      is_public: isPublic,
    }),
  getAnnotations: (gameId, userId = null) => {
    const params = { pgn_id: gameId };
    if (userId) params.user_id = userId;
    return get('/chess/get-annotations.php', { params });
  },
  getCategories: () => get('/chess/get-categories.php'),
  getUserPreferences: () => get('/chess/get-preferences.php'),
  updateUserPreferences: (preferences) => post('/chess/update-preferences.php', preferences),
  sharePGN: (gameId, userIds, batchIds, permission = 'view') =>
    post('/chess/share-pgn.php', { pgn_id: gameId, user_ids: userIds, batch_ids: batchIds, permission }),
  getShareableEntities: () => get('/chess/get-shareable-entities.php'),
  getSharedPGNs: () => get('/chess/get-shared-pgns.php'),
  getPGNStats: (gameId = null) => {
    const params = gameId ? { pgn_id: gameId } : {};
    return get('/chess/get-stats.php', { params });
  },
  exportPGNGames: (gameIds, format = 'pgn') =>
    post('/chess/export-games.php', { game_ids: gameIds, format }, { responseType: 'blob' }),
  validatePGN: (pgnContent) => post('/chess/validate-pgn.php', { pgn_content: pgnContent }),
  advancedSearch: (searchOptions) => post('/chess/advanced-search.php', searchOptions),
};

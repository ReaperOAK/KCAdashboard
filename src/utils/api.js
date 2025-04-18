class ApiService {
  // Change this to be dynamic based on environment
  static API_URL = process.env.NODE_ENV === 'production' 
    ? 'https://dashboard.kolkatachessacademy.in/api/endpoints'
    : '/api/endpoints';
  
  // Add method to get correct local asset URLs
  static getAssetUrl(path) {
    // Always use absolute paths for local assets
    if (path.startsWith('/')) {
      return path;
    }
    return `/${path}`;
  }

  static async request(endpoint, method = 'GET', data = null, options = {}) {
    const token = localStorage.getItem('token');
    let url = endpoint.startsWith('http') ? endpoint : `${this.API_URL}${endpoint}`;
    
    if (options.params) {
      const queryParams = new URLSearchParams(options.params).toString();
      url = `${url}${url.includes('?') ? '&' : '?'}${queryParams}`;
    }
    
    console.log('Making API request to:', url);
    
    const headers = {
      'Authorization': token ? `Bearer ${token}` : '',
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    };

    if (options.headers) {
      Object.assign(headers, options.headers);
    }

    try {
      const response = await fetch(url, {
        method,
        headers,
        credentials: 'include',
        body: data ? JSON.stringify(data) : null
      });

      // Check for token renewal
      const tokenRenewed = response.headers.get('X-Token-Renewed');
      if (tokenRenewed === 'true') {
        const newExpiry = response.headers.get('X-Token-Expires');
        if (newExpiry) {
          // Update token expiry in localStorage
          const tokenData = {
            token: localStorage.getItem('token'),
            expires_at: newExpiry
          };
          localStorage.setItem('tokenData', JSON.stringify(tokenData));
        }
      }

      // Special handling for blob responses
      if (options.responseType === 'blob') {
        if (!response.ok) {
          const text = await response.text();
          try {
            const error = JSON.parse(text);
            throw new Error(error.message || 'Failed to download file');
          } catch (e) {
            throw new Error('Failed to download file');
          }
        }
        return response.blob();
      }

      // Handle regular JSON responses
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        try {
          // First check if the response is empty
          const text = await response.text();
          if (!text.trim()) {
            throw new Error('Empty response from server');
          }
          
          // Then parse the JSON
          try {
            const result = JSON.parse(text);
            if (!response.ok) {
              throw new Error(result.message || `HTTP error! status: ${response.status}`);
            }
            return result;
          } catch (parseError) {
            console.error('JSON parse error:', parseError);
            // If the response contains HTML (likely an error page)
            if (text.includes('<!DOCTYPE html>') || text.includes('<br />')) {
              // Extract error message from PHP error if possible
              const errorMatch = text.match(/Fatal error:(.*?)in/);
              const errorMessage = errorMatch ? errorMatch[1].trim() : 'Server returned HTML instead of JSON';
              throw new Error(`Server error: ${errorMessage}`);
            }
            throw new Error(`Failed to parse JSON response: ${text.substring(0, 100)}...`);
          }
        } catch (jsonError) {
          console.error('JSON parsing error:', jsonError);
          throw jsonError;
        }
      }

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || 'Network response was not ok');
      }

      return response;
    } catch (error) {
      console.error('API Error:', error);
      
      // If token is expired, clear auth data and redirect to login
      if (error.message.includes('expired') || error.message.includes('invalid token')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
      
      throw error;
    }
  }

  static async postFormData(endpoint, formData) {
    const token = localStorage.getItem('token');
    const url = endpoint.startsWith('http') ? endpoint : `${this.API_URL}${endpoint}`;
    
    try {
      console.log('Making FormData API request to:', url);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          // Don't set Content-Type for FormData, browser will set it with boundary
        },
        credentials: 'include',
        body: formData
      });
      
      const contentType = response.headers.get('content-type');
      
      // First get response as text
      const text = await response.text();
      
      // Check if response contains PHP error
      if (text.includes('Fatal error') || text.includes('<br />')) {
        console.error('PHP Error in response:', text);
        // Extract the error message from PHP error output
        const errorMatch = text.match(/Fatal error:(.*?)in/);
        const errorMessage = errorMatch ? errorMatch[1].trim() : 'Server returned an error';
        throw new Error(`PHP Error: ${errorMessage}`);
      }
      
      // Parse as JSON if it looks like JSON - fix operator precedence with parentheses
      if ((contentType && contentType.includes('application/json')) || 
          (text.startsWith('{') && text.endsWith('}'))) {
        try {
          const result = JSON.parse(text);
          if (!response.ok) {
            throw new Error(result.message || `HTTP error! status: ${response.status}`);
          }
          return result;
        } catch (jsonError) {
          console.error('JSON parsing error:', jsonError, 'Response text:', text);
          throw new Error('Invalid JSON response from server');
        }
      }
      
      if (!response.ok) {
        throw new Error(text || `HTTP error! status: ${response.status}`);
      }
      
      return { success: true, message: 'Operation completed successfully' };
    } catch (error) {
      console.error('API FormData Error:', error);
      throw error;
    }
  }

  static get(endpoint) {
    return this.request(endpoint);
  }

  static post(endpoint, data) {
    return this.request(endpoint, 'POST', data);
  }

  static put(endpoint, data) {
    return this.request(endpoint, 'PUT', data);
  }

  static delete(endpoint) {
    return this.request(endpoint, 'DELETE');
  }

  // Admin Dashboard specific endpoints
  static async getDashboardStats() {
    try {
      const response = await this.get('/admin/dashboard-stats.php');
      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch dashboard stats');
      }
      return response;
    } catch (error) {
      console.error('Dashboard stats error:', error);
      throw error;
    }
  }

  static async getBatchStats() {
    return this.get('/admin/batch-stats.php');
  }

  static async getAttendanceOverview() {
    return this.get('/admin/attendance-overview.php');
  }

  // Batch Management endpoints
  static async getBatches() {
    return this.get('/batches/get-all.php');
  }

  static async createBatch(batchData) {
    return this.post('/batches/create.php', batchData);
  }

  static async updateBatch(id, batchData) {
    return this.put(`/batches/update.php?id=${id}`, batchData);
  }

  static async deleteBatch(id) {
    return this.delete(`/batches/delete.php?id=${id}`);
  }

  static async getBatchDetails(id) {
    return this.get(`/batches/get-details.php?id=${id}`);
  }

  static async getBatchStudents(id) {
    return this.get(`/batches/get-students.php?id=${id}`);
  }

  static async addStudentToBatch(batchId, studentId) {
    return this.post('/batches/add-student.php', { batch_id: batchId, student_id: studentId });
  }

  static async removeStudentFromBatch(batchId, studentId) {
    return this.post('/batches/remove-student.php', { batch_id: batchId, student_id: studentId });
  }

  // Teacher Analytics Endpoints
  static async getTeacherStats(batchId = 'all') {
    return this.get(`/analytics/teacher-stats.php?batch=${batchId}`);
  }

  static async getStudentPerformance(studentId, timeframe = 'month', batchId = null) {
    let url = `/analytics/student-performance.php?student_id=${studentId}&timeframe=${timeframe}`;
    
    // Add batch_id parameter if provided (for the teacher analytics endpoint)
    if (batchId) {
      url += `&batch_id=${batchId}`;
    }
    
    return this.get(url);
  }

  static async getBatchAttendance(batchId, startDate = null, endDate = null) {
    let url = `/analytics/attendance.php?batch_id=${batchId}`;
    if (startDate) url += `&start_date=${startDate}`;
    if (endDate) url += `&end_date=${endDate}`;
    return this.get(url);
  }

  static async getQuizResults(batchId = null, quizId = null) {
    let url = '/analytics/quiz-results.php?';
    if (batchId) url += `batch_id=${batchId}&`;
    if (quizId) url += `quiz_id=${quizId}`;
    return this.get(url);
  }

  static async exportReport(type, filters = {}) {
    return this.request('/analytics/export.php', 'POST', { type, filters }, { responseType: 'blob' });
  }

  static async getStudentProgress(studentId, timeframe = 'month') {
    return this.get(`/analytics/student-progress.php?student_id=${studentId}&timeframe=${timeframe}`);
  }

  static async getBatchComparison(batchIds = []) {
    return this.post('/analytics/batch-comparison.php', { batch_ids: batchIds });
  }

  // Grading & Feedback endpoints
  static async submitFeedback(feedbackData) {
    return this.post('/grading/submit-feedback.php', feedbackData);
  }
  
  static async getFeedbackHistory(studentId) {
    return this.get(`/grading/get-student-feedback-history.php?student_id=${studentId}`);
  }

  // PGN Database endpoints
  static async getTeacherPGNs(filter = 'own') {
    try {
      const response = await this.get(`/pgn/get-teacher-pgns.php?filter=${filter}`);
      return response;
    } catch (error) {
      console.error('Failed to fetch PGNs:', error);
      // Return a default structure with an empty array to prevent UI errors
      return { success: false, pgns: [], message: error.message };
    }
  }

  static async getPGNById(id) {
    return this.get(`/pgn/get-pgn.php?id=${id}`);
  }

  static async getPublicPGNs(category = null, teacherId = null) {
    let url = '/pgn/get-public-pgns.php';
    const params = {};
    
    if (category) params.category = category;
    if (teacherId) params.teacher_id = teacherId;
    
    return this.get(url, { params });
  }

  static async uploadPGN(pgnData, pgnFile = null) {
    const formData = new FormData();
    formData.append('data', JSON.stringify(pgnData));
    
    if (pgnFile) {
      formData.append('pgn_file', pgnFile);
    }
    
    return this.postFormData('/pgn/upload.php', formData);
  }

  static async updatePGN(id, pgnData) {
    pgnData.id = id;
    return this.put('/pgn/update.php', pgnData);
  }

  static async deletePGN(id) {
    return this.delete(`/pgn/delete.php?id=${id}`);
  }

  static async sharePGN(pgnId, userIds, permission = 'view') {
    return this.post('/pgn/share.php', {
      pgn_id: pgnId,
      user_ids: userIds,
      permission
    });
  }

  static async removeShare(pgnId, userId) {
    return this.post('/pgn/remove-share.php', {
      pgn_id: pgnId,
      user_id: userId
    });
  }

  static async getPGNShareUsers(pgnId) {
    return this.get(`/pgn/get-share-users.php?pgn_id=${pgnId}`);
  }

  static async getTeachers() {
    return this.get('/pgn/get-teachers.php');
  }

  static async validatePGN(pgnContent) {
    return this.post('/pgn/validate.php', { pgn_content: pgnContent });
  }

  // Resource Management endpoints
  static async getResources(category = null) {
    try {
      const endpoint = category && category !== 'all' 
        ? `/resources/get-by-category.php?category=${category}`
        : '/resources/get-all.php';
        
      return this.get(endpoint);
    } catch (error) {
      console.error('Error fetching resources:', error);
      throw error;
    }
  }

  static async getFeaturedResources() {
    return this.get('/resources/get-featured.php');
  }

  static async searchResources(query, filters = {}) {
    let endpoint = `/resources/search.php?q=${encodeURIComponent(query)}`;
    
    // Add filters to query string
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        endpoint += `&${key}=${encodeURIComponent(value)}`;
      }
    });
    
    return this.get(endpoint);
  }

  static async uploadResource(formData) {
    const token = localStorage.getItem('token');
    const response = await fetch(`${this.API_URL}/resources/upload.php`, {
      method: 'POST',
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
      },
      body: formData
    });
    
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || `HTTP error! status: ${response.status}`);
      }
      return result;
    }
    
    if (!response.ok) {
      throw new Error('Failed to upload resource');
    }
    
    return { success: true };
  }

  static async bookmarkResource(resourceId) {
    return this.post('/resources/bookmark.php', { resource_id: resourceId });
  }

  static async unbookmarkResource(resourceId) {
    return this.post('/resources/unbookmark.php', { resource_id: resourceId });
  }

  static async getUserBookmarks() {
    return this.get('/resources/get-bookmarks.php');
  }

  static getResourceDownloadUrl(resourceId) {
    return `${this.API_URL}/resources/download.php?id=${resourceId}`;
  }

  // Chess API endpoints
  static async getSimulGames() {
    return this.get('/chess/simul-games.php');
  }

  static async createSimulGame(data) {
    return this.post('/chess/create-simul.php', data);
  }

  static async joinSimulGame(id) {
    return this.post('/chess/join-simul.php', { simul_id: id });
  }

  static async makeSimulMove(simulId, boardId, move, fen) {
    return this.post('/chess/simul-move.php', {
      simul_id: simulId,
      board_id: boardId,
      move,
      fen
    });
  }

  static async getChessStudies() {
    return this.get('/chess/studies.php');
  }

  static async getSharedChessStudies() {
    return this.get('/chess/shared-studies.php');
  }

  static async getStudyDetails(id) {
    return this.get(`/chess/study.php?id=${id}`);
  }

  static async createChessStudy(studyData) {
    return this.post('/chess/create-study.php', studyData);
  }

  static async updateChessStudy(id, studyData) {
    return this.put(`/chess/update-study.php?id=${id}`, studyData);
  }

  static async shareChessStudy(id, userIds) {
    return this.post('/chess/share-study.php', {
      study_id: id,
      user_ids: userIds
    });
  }

  static async getChessGames(status = 'all') {
    return this.get(`/chess/games.php?status=${status}`);
  }

  static async getGameDetails(id) {
    return this.get(`/chess/game.php?id=${id}`);
  }

  static async makeGameMove(gameId, move, fen) {
    return this.post('/chess/make-move.php', {
      game_id: gameId,
      move,
      fen
    });
  }

  static async challengePlayer(userId, gameSettings) {
    return this.post('/chess/challenge.php', {
      opponent_id: userId,
      ...gameSettings
    });
  }

  static async respondToChallenge(challengeId, accept) {
    return this.post('/chess/respond-challenge.php', {
      challenge_id: challengeId,
      accept
    });
  }

  static async getOnlinePlayers() {
    return this.get('/chess/online-players.php');
  }

  static async getPracticePositions(type = 'all') {
    return this.get(`/chess/practice-positions.php?type=${type}`);
  }

  static async createPracticePosition(positionData) {
    return this.post('/chess/create-practice.php', positionData);
  }

  static async getEngineEvaluation(fen, depth = 15) {
    return this.post('/chess/engine-analysis.php', { fen, depth });
  }

  static async saveGameResult(gameId, result) {
    return this.post('/chess/save-result.php', { game_id: gameId, result });
  }

  static async getPlayerStats() {
    return this.get('/chess/player-stats.php');
  }

  static async getChallenges() {
    return this.get('/chess/challenges.php');
  }
}

export default ApiService;

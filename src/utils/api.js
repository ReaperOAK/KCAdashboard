class ApiService {
  static API_URL = 'https://dashboard.kolkatachessacademy.in/api/endpoints';

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
          const result = JSON.parse(text);
          if (!response.ok) {
            throw new Error(result.message || `HTTP error! status: ${response.status}`);
          }
          return result;
        } catch (jsonError) {
          console.error('JSON parsing error:', jsonError);
          throw new Error(`Failed to parse JSON response: ${jsonError.message}`);
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
    if (pgnFile) {
      const formData = new FormData();
      formData.append('data', JSON.stringify(pgnData));
      formData.append('pgn_file', pgnFile);
      
      return this.request('/pgn/upload.php', 'POST', formData, {
        headers: { 'Content-Type': undefined } // Let browser set content type with boundary
      });
    } else {
      return this.post('/pgn/upload.php', pgnData);
    }
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
}

export default ApiService;

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
    try {
      console.log(`Starting export of ${type} report with filters:`, filters);
      
      // Add some basic validation
      if (!type) {
        throw new Error('Export type is required');
      }
      
      // Create the request body
      const requestBody = { type, filters };
      
      // Make the request with special handling for blob response
      const response = await fetch(`${this.API_URL}/analytics/export.php`, {
        method: 'POST',
        headers: {
          'Authorization': localStorage.getItem('token') ? `Bearer ${localStorage.getItem('token')}` : '',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });
      
      // Log the response status for debugging
      console.log(`Export API response status: ${response.status}`);
      
      if (!response.ok) {
        // Try to get error details from response if possible
        const contentType = response.headers.get('content-type');
        
        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json();
          throw new Error(errorData.message || `Export failed with status: ${response.status}`);
        } else {
          const errorText = await response.text();
          console.error('Export API error text:', errorText);
          throw new Error(`Export failed with status: ${response.status}`);
        }
      }
      
      // Check if we got a spreadsheet file
      const contentType = response.headers.get('content-type');
      const contentDisposition = response.headers.get('content-disposition');
      
      if (!contentType || !contentType.includes('spreadsheetml.sheet')) {
        console.error('Unexpected content type:', contentType);
        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Invalid response format from server');
        } else {
          const errorText = await response.text();
          console.error('Unexpected response:', errorText);
          throw new Error('Server did not return an Excel file');
        }
      }
      
      // Return the blob for downloading
      return await response.blob();
    } catch (error) {
      console.error('Export request error:', error);
      throw error;
    }
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
}

export default ApiService;

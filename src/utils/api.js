class ApiService {
  static API_URL = 'https://dashboard.kolkatachessacademy.in/api/endpoints';

  static async request(endpoint, method = 'GET', data = null, options = {}) {
    const token = localStorage.getItem('token');
    
    // Handle query parameters
    let url = endpoint.startsWith('http') ? endpoint : `${this.API_URL}${endpoint}`;
    
    // If there are query parameters in options, append them to the URL
    if (options.params) {
      const queryParams = new URLSearchParams(options.params).toString();
      url = `${url}${url.includes('?') ? '&' : '?'}${queryParams}`;
    }
    
    console.log('Making API request to:', url);
    
    // Default headers with CORS configuration
    const headers = {
      'Authorization': token ? `Bearer ${token}` : '',
      'Accept': 'application/json',
    };

    // Only set Content-Type if not FormData
    if (!(data instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }

    // Merge with custom headers from options
    if (options.headers) {
      Object.assign(headers, options.headers);
    }

    const config = {
      method,
      headers,
      credentials: 'include',
      mode: 'cors'
    };

    if (data) {
      // Don't stringify if it's FormData
      config.body = data instanceof FormData ? data : JSON.stringify(data);
    }

    try {
      const response = await fetch(url, config);
      const contentType = response.headers.get('content-type');
      
      // Parse response based on content type
      let result;
      if (contentType && contentType.includes('application/json')) {
        result = await response.json();
      } else {
        const text = await response.text();
        try {
          result = JSON.parse(text);
        } catch (e) {
          result = { success: false, message: text || 'Unknown error occurred' };
        }
      }

      if (!response.ok) {
        throw new Error(result.message || `HTTP error! status: ${response.status}`);
      }

      return result;
    } catch (error) {
      console.error('API Error:', error);
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
}

export default ApiService;

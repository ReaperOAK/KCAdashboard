const API_URL = process.env.REACT_APP_API_URL || 'https://dashboard.kolkatachessacademy.in/api/endpoints';

class ApiService {
  static async request(endpoint, method = 'GET', data = null, options = {}) {
    const token = localStorage.getItem('token');
    const url = endpoint.startsWith('http') ? endpoint : `${API_URL}${endpoint}`;
    
    console.log('Making API request to:', url);
    console.log('Request data:', data);
    
    // Default headers
    const headers = {
      'Authorization': token ? `Bearer ${token}` : '',
      'Accept': 'application/json'
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
    };

    if (data) {
      // Don't stringify if it's FormData
      config.body = data instanceof FormData ? data : JSON.stringify(data);
    }

    try {
      const response = await fetch(url, config);
      console.log('Response status:', response.status);
      
      // Check for empty response
      const text = await response.text();
      if (!text) {
        return { message: 'Success' }; // Return default response for empty responses
      }

      // Parse JSON response
      const result = JSON.parse(text);

      if (!response.ok) {
        throw new Error(result.message || 'API request failed');
      }

      return result;
    } catch (error) {
      console.error('API Error:', error);
      console.error('Failed request URL:', url);
      console.error('Request config:', config);
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
    return this.get('/admin/dashboard-stats.php');
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

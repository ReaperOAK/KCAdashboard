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
        const result = await response.json();
        if (!response.ok) {
          throw new Error(result.message || `HTTP error! status: ${response.status}`);
        }
        return result;
      }

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      return response;
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

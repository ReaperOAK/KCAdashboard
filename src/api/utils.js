// Shared API helpers for all feature modules
export const API_URL = process.env.NODE_ENV === 'development'
  ? 'https://dashboard.kolkatachessacademy.in/api/endpoints'
  : 'https://dashboard.kolkatachessacademy.in/api/endpoints';

export function getAssetUrl(path) {
  if (path.startsWith('/')) return path;
  return `/${path}`;
}

export async function request(endpoint, method = 'GET', data = null, options = {}) {
  const token = localStorage.getItem('token');
  let url = endpoint.startsWith('http') ? endpoint : `${API_URL}${endpoint}`;
  if (options.params) {
    const queryParams = new URLSearchParams(options.params).toString();
    url = `${url}${url.includes('?') ? '&' : '?'}${queryParams}`;
  }
  const headers = {
    'Authorization': token ? `Bearer ${token}` : '',
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    ...options.headers,
  };
  try {
    const response = await fetch(url, {
      method,
      headers,
      credentials: 'include',
      mode: 'cors',
      body: data ? JSON.stringify(data) : null,
    });
    // Token renewal
    const tokenRenewed = response.headers.get('X-Token-Renewed');
    if (tokenRenewed === 'true') {
      const newExpiry = response.headers.get('X-Token-Expires');
      if (newExpiry) {
        const tokenData = {
          token: localStorage.getItem('token'),
          expires_at: newExpiry,
        };
        localStorage.setItem('tokenData', JSON.stringify(tokenData));
      }
    }
    // Blob response
    if (options.responseType === 'blob') {
      if (!response.ok) {
        const text = await response.text();
        try {
          const error = JSON.parse(text);
          throw new Error(error.message || 'Failed to download file');
        } catch {
          throw new Error('Failed to download file');
        }
      }
      return response.blob();
    }
    // JSON response
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const text = await response.text();
      if (!text.trim()) throw new Error('Empty response from server');
      try {
        const result = JSON.parse(text);
        if (!response.ok) {
          if (result && result.message) throw new Error(result.message);
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return result;
      } catch (parseError) {
        if (parseError instanceof SyntaxError) {
          if (text.includes('<!DOCTYPE html>') || text.includes('<br />')) {
            const errorMatch = text.match(/Fatal error:(.*?)in/);
            const errorMessage = errorMatch ? errorMatch[1].trim() : 'Server returned HTML instead of JSON';
            throw new Error(`Server error: ${errorMessage}`);
          }
          throw new Error(`Failed to parse JSON response: ${text.substring(0, 100)}...`);
        }
        throw parseError;
      }
    }
    // HTML error
    if (contentType && contentType.includes('text/html')) {
      const text = await response.text();
      if (text.includes('<!DOCTYPE html>') && text.includes('React App')) {
        throw new Error(`API endpoint not found - received React app instead of API response. Check if the endpoint ${endpoint} exists on the server.`);
      }
    }
    if (!response.ok) {
      const text = await response.text();
      throw new Error(text || 'Network response was not ok');
    }
    return response;
  } catch (error) {
    // Token expired/invalid
    if (error.message.includes('expired') || error.message.includes('invalid token')) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    throw error;
  }
}

export async function postFormData(endpoint, formData) {
  const token = localStorage.getItem('token');
  const url = endpoint.startsWith('http') ? endpoint : `${API_URL}${endpoint}`;
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
      },
      credentials: 'include',
      body: formData,
    });
    const contentType = response.headers.get('content-type');
    const text = await response.text();
    if (text.includes('Fatal error') || text.includes('<br />')) {
      const errorMatch = text.match(/Fatal error:(.*?)in/);
      const errorMessage = errorMatch ? errorMatch[1].trim() : 'Server returned an error';
      throw new Error(`PHP Error: ${errorMessage}`);
    }
    if ((contentType && contentType.includes('application/json')) || (text.startsWith('{') && text.endsWith('}'))) {
      try {
        const result = JSON.parse(text);
        if (!response.ok) throw new Error(result.message || `HTTP error! status: ${response.status}`);
        return result;
      } catch {
        throw new Error('Invalid JSON response from server');
      }
    }
    if (!response.ok) throw new Error(text || `HTTP error! status: ${response.status}`);
    return { success: true, message: 'Operation completed successfully' };
  } catch (error) {
    throw error;
  }
}

export function get(endpoint, options = {}) {
  return request(endpoint, 'GET', null, options);
}

export function post(endpoint, data) {
  return request(endpoint, 'POST', data);
}

export function put(endpoint, data) {
  return request(endpoint, 'PUT', data);
}

export function del(endpoint) {
  return request(endpoint, 'DELETE');
}

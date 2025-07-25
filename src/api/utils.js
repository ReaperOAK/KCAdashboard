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
          console.error('Failed to parse JSON response:', text);
          
          // Check if response contains PHP warnings/errors but also has JSON
          if (text.includes('<br />') || text.includes('Warning:') || text.includes('Fatal error:')) {
            // Try to extract JSON from the end of the response (after PHP warnings)
            const jsonMatch = text.match(/(\{.*\})[\s]*$/s);
            if (jsonMatch) {
              try {
                const result = JSON.parse(jsonMatch[1]);
                console.log('Successfully extracted JSON from response with PHP warnings:', result);
                return result;
              } catch {
                // Failed to parse extracted JSON
              }
            }
            
            // If HTML/PHP error without recoverable JSON
            if (text.includes('<!DOCTYPE html>')) {
              const errorMatch = text.match(/Fatal error:(.*?)in/);
              const errorMessage = errorMatch ? errorMatch[1].trim() : 'Server returned HTML instead of JSON';
              throw new Error(`Server error: ${errorMessage}`);
            }
          }
          
          // Try to extract JSON from anywhere in the text
          const jsonMatch = text.match(/(\{.*\})/s);
          if (jsonMatch) {
            try {
              const result = JSON.parse(jsonMatch[1]);
              console.log('Successfully extracted JSON from response:', result);
              return result;
            } catch {
              // Failed to parse extracted JSON
            }
          }
          
          throw new Error(`Failed to parse JSON response: ${text.substring(0, 200)}...`);
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
    // Suppress console errors for draw offer endpoints that might not be deployed yet
    if (endpoint.includes('draw-offers') || endpoint.includes('offer-draw') || endpoint.includes('respond-draw')) {
      // Re-throw the error but don't log it to console
      throw error;
    }
    
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

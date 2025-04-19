import axios from 'axios';

/**
 * Enhanced API client with performance optimizations:
 * - Request deduplication
 * - Request batching
 * - Response caching
 * - Retry logic with exponential backoff
 * - Request prioritization
 */
class OptimizedApiClient {
  constructor(options = {}) {
    this.baseURL = options.baseURL || '';
    this.timeout = options.timeout || 10000;
    this.cacheTime = options.cacheTime || 60000; // 1 minute default cache
    
    // Create axios instance
    this.axios = axios.create({
      baseURL: this.baseURL,
      timeout: this.timeout,
    });
    
    // In-memory cache store
    this.cache = new Map();
    
    // Track in-flight requests to deduplicate
    this.pendingRequests = new Map();
    
    // Batch processing
    this.batchedRequests = [];
    this.batchTimeout = null;
    
    // Add interceptor for error handling and retries
    this.axios.interceptors.response.use(
      response => response,
      async error => {
        const config = error.config;
        
        // Skip retry for specific status codes
        if (error.response && (error.response.status === 401 || error.response.status === 403 || error.response.status === 404)) {
          return Promise.reject(error);
        }
        
        // Implement retry logic with exponential backoff
        config.__retryCount = config.__retryCount || 0;
        
        if (config.__retryCount < (config.retryLimit || 2)) {
          config.__retryCount += 1;
          
          // Exponential backoff delay
          const backoffDelay = Math.pow(2, config.__retryCount) * 1000 + Math.random() * 1000;
          
          // Wait for the backoff delay
          await new Promise(resolve => setTimeout(resolve, backoffDelay));
          
          // Retry the request
          return this.axios(config);
        }
        
        return Promise.reject(error);
      }
    );
  }
  
  /**
   * Clear the entire cache or specific cached responses
   * @param {string} cacheKey Optional key to clear specific cache entry
   */
  clearCache(cacheKey) {
    if (cacheKey) {
      this.cache.delete(cacheKey);
    } else {
      this.cache.clear();
    }
  }
  
  /**
   * Generate a cache key from request params
   */
  generateCacheKey(config) {
    const { url, params, data, method } = config;
    return `${method}:${url}:${JSON.stringify(params || {})}:${JSON.stringify(data || {})}`;
  }
  
  /**
   * Check if response is cacheable
   */
  isCacheable(config) {
    return (config.method === 'get' && config.cache !== false);
  }
  
  /**
   * Make an API request with caching, deduplication, and retries
   */
  async request(config) {
    const cacheKey = this.generateCacheKey(config);
    
    // Check cache first for GET requests
    if (this.isCacheable(config)) {
      const cachedResponse = this.cache.get(cacheKey);
      if (cachedResponse && Date.now() < cachedResponse.expiry) {
        return Promise.resolve(cachedResponse.data);
      }
    }
    
    // Deduplicate in-flight requests
    if (this.pendingRequests.has(cacheKey)) {
      return this.pendingRequests.get(cacheKey);
    }
    
    // Create the request promise
    const requestPromise = this.axios(config)
      .then(response => {
        // Cache the successful response for GET requests
        if (this.isCacheable(config)) {
          const cacheTime = config.cacheTime || this.cacheTime;
          this.cache.set(cacheKey, {
            data: response,
            expiry: Date.now() + cacheTime
          });
        }
        
        // Remove from pending requests
        this.pendingRequests.delete(cacheKey);
        
        return response;
      })
      .catch(error => {
        // Remove from pending requests
        this.pendingRequests.delete(cacheKey);
        throw error;
      });
    
    // Store the pending request
    this.pendingRequests.set(cacheKey, requestPromise);
    
    return requestPromise;
  }
  
  /**
   * Add a request to the batch queue
   */
  batchRequest(config) {
    return new Promise((resolve, reject) => {
      this.batchedRequests.push({
        config,
        resolve,
        reject,
        priority: config.priority || 0
      });
      
      // Start batch processing if not already scheduled
      if (!this.batchTimeout) {
        this.batchTimeout = setTimeout(() => this.processBatch(), 50);
      }
    });
  }
  
  /**
   * Process all batched requests
   */
  processBatch() {
    const requests = [...this.batchedRequests];
    this.batchedRequests = [];
    this.batchTimeout = null;
    
    if (requests.length === 0) return;
    
    // Sort by priority (higher number = higher priority)
    requests.sort((a, b) => b.priority - a.priority);
    
    // Process each request
    requests.forEach(({ config, resolve, reject }) => {
      this.request(config)
        .then(resolve)
        .catch(reject);
    });
  }
  
  /**
   * Convenience methods for common HTTP methods
   */
  get(url, config = {}) {
    return this.request({ ...config, method: 'get', url });
  }
  
  post(url, data, config = {}) {
    return this.request({ ...config, method: 'post', url, data });
  }
  
  put(url, data, config = {}) {
    return this.request({ ...config, method: 'put', url, data });
  }
  
  delete(url, config = {}) {
    return this.request({ ...config, method: 'delete', url });
  }
  
  /**
   * Batch versions of common HTTP methods
   */
  batchGet(url, config = {}) {
    return this.batchRequest({ ...config, method: 'get', url });
  }
  
  batchPost(url, data, config = {}) {
    return this.batchRequest({ ...config, method: 'post', url, data });
  }
}

// Create a singleton instance
const apiClient = new OptimizedApiClient({
  baseURL: process.env.REACT_APP_API_URL || '/api',
  timeout: 15000,
  cacheTime: 60000 // 1 minute
});

export default apiClient;
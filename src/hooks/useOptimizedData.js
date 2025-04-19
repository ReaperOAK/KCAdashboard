import { useState, useEffect, useRef, useCallback } from 'react';
import apiClient from '../utils/optimizedApiClient';
import PerformanceMonitor from '../utils/PerformanceMonitor';

/**
 * Custom hook for optimized data fetching with caching, loading states and error handling
 * 
 * @param {string} url - API endpoint URL
 * @param {Object} options - Options for the fetch operation
 * @param {Object} options.params - URL parameters
 * @param {boolean} options.skip - Whether to skip the fetch (for conditional fetching)
 * @param {Object} options.initialData - Initial data to use before fetching
 * @param {number} options.cacheTime - How long to cache the data in ms
 * @param {boolean} options.refetchOnWindowFocus - Whether to refetch on window focus
 * @param {function} options.onSuccess - Callback for successful fetch
 * @param {function} options.onError - Callback for fetch error
 * @param {Array} options.dependencies - Additional dependencies for triggering refetch
 */
export const useOptimizedQuery = (url, options = {}) => {
  const {
    params = {},
    skip = false,
    initialData = null,
    cacheTime = 60000, // 1 minute
    refetchOnWindowFocus = true,
    onSuccess = null,
    onError = null,
    dependencies = []
  } = options;

  const [data, setData] = useState(initialData);
  const [isLoading, setIsLoading] = useState(!skip && !initialData);
  const [error, setError] = useState(null);
  const [isRefetching, setIsRefetching] = useState(false);
  
  // Use refs to avoid triggering effect for function changes
  const onSuccessRef = useRef(onSuccess);
  const onErrorRef = useRef(onError);
  
  // Keep track of last fetch time for performance metrics
  const lastFetchTimeRef = useRef(null);
  
  // Track if component is mounted
  const isMountedRef = useRef(true);
  
  useEffect(() => {
    onSuccessRef.current = onSuccess;
    onErrorRef.current = onError;
  }, [onSuccess, onError]);
  
  // Memoize the fetch function
  const fetchData = useCallback(async (showLoading = true) => {
    if (skip) return;
    
    if (showLoading) {
      setIsLoading(true);
    } else {
      setIsRefetching(true);
    }
    
    setError(null);
    
    try {
      // Start performance monitoring
      const perfLabel = `fetch-${url}`;
      PerformanceMonitor.start(perfLabel);
      lastFetchTimeRef.current = Date.now();
      
      // Make the API request
      const response = await apiClient.get(url, {
        params,
        cacheTime,
      });
      
      // Track performance metrics
      const fetchTime = Date.now() - lastFetchTimeRef.current;
      PerformanceMonitor.end(perfLabel);
      
      // Log slow requests in development
      if (process.env.NODE_ENV !== 'production' && fetchTime > 500) {
        console.warn(`Slow fetch detected (${fetchTime}ms): ${url}`);
      }
      
      // Update state if component is still mounted
      if (isMountedRef.current) {
        setData(response.data);
        
        if (onSuccessRef.current) {
          onSuccessRef.current(response.data);
        }
      }
    } catch (err) {
      // Only update error state if component is still mounted
      if (isMountedRef.current) {
        console.error('Fetch error:', err);
        setError(err);
        
        if (onErrorRef.current) {
          onErrorRef.current(err);
        }
      }
    } finally {
      // Reset loading states if component is still mounted
      if (isMountedRef.current) {
        setIsLoading(false);
        setIsRefetching(false);
      }
    }
  }, [url, skip, params, cacheTime]);
  
  // Function to manually trigger a refetch
  const refetch = useCallback(() => {
    return fetchData(false);
  }, [fetchData]);
  
  // Handle window focus events for refetching
  useEffect(() => {
    if (!refetchOnWindowFocus) return;
    
    const handleFocus = () => {
      refetch();
    };
    
    window.addEventListener('focus', handleFocus);
    
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, [refetchOnWindowFocus, refetch]);
  
  // Fetch data when dependencies change
  useEffect(() => {
    fetchData();
  }, [fetchData, ...dependencies]);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);
  
  return {
    data,
    isLoading,
    isRefetching,
    error,
    refetch,
    // For optimistic updates
    setData
  };
};

/**
 * Custom hook for optimized data mutations (POST, PUT, DELETE)
 * 
 * @param {string} url - API endpoint URL
 * @param {Object} options - Options for the mutation
 * @param {string} options.method - HTTP method (post, put, delete)
 * @param {function} options.onSuccess - Callback for successful mutation
 * @param {function} options.onError - Callback for mutation error
 */
export const useOptimizedMutation = (url, options = {}) => {
  const {
    method = 'post',
    onSuccess = null,
    onError = null
  } = options;
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  
  // Use refs to avoid triggering effect for function changes
  const onSuccessRef = useRef(onSuccess);
  const onErrorRef = useRef(onError);
  
  useEffect(() => {
    onSuccessRef.current = onSuccess;
    onErrorRef.current = onError;
  }, [onSuccess, onError]);
  
  // The mutation function to be called
  const mutate = useCallback(async (payload, customOptions = {}) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Start performance monitoring
      const perfLabel = `mutation-${url}`;
      PerformanceMonitor.start(perfLabel);
      
      // Make the API request based on method
      let response;
      if (method === 'post') {
        response = await apiClient.post(url, payload, customOptions);
      } else if (method === 'put') {
        response = await apiClient.put(url, payload, customOptions);
      } else if (method === 'delete') {
        response = await apiClient.delete(url, { data: payload, ...customOptions });
      }
      
      // End performance monitoring
      PerformanceMonitor.end(perfLabel);
      
      setData(response.data);
      setIsLoading(false);
      
      if (onSuccessRef.current) {
        onSuccessRef.current(response.data, payload);
      }
      
      return response.data;
      
    } catch (err) {
      console.error('Mutation error:', err);
      setError(err);
      setIsLoading(false);
      
      if (onErrorRef.current) {
        onErrorRef.current(err);
      }
      
      throw err;
    }
  }, [url, method]);
  
  // Reset state
  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setIsLoading(false);
  }, []);
  
  return {
    mutate,
    isLoading,
    error,
    data,
    reset
  };
};
import { useState, useEffect, useRef, useCallback } from 'react';
import PerformanceMonitor from '../utils/PerformanceMonitor';

/**
 * Hook for optimizing expensive operations with memoization and performance tracking
 * @param {Function} computeExpensiveValue - Function that computes an expensive value
 * @param {Array} dependencies - Array of dependencies that should trigger recomputation
 * @param {String} operationName - Name of the operation for performance tracking
 */
export const useOptimizedValue = (computeExpensiveValue, dependencies = [], operationName = 'computation') => {
  // Store the memoized value
  const [value, setValue] = useState(null);
  
  // Keep track of previous deps to avoid unnecessary recomputation
  const prevDepsRef = useRef(dependencies);
  
  // Flag for initial calculation
  const isFirstRender = useRef(true);
  
  // Cache for memoization
  const cache = useRef(new Map());
  
  // Generate a cache key from dependencies
  const getCacheKey = useCallback((deps) => {
    return deps.map(dep => {
      if (typeof dep === 'object' && dep !== null) {
        return JSON.stringify(dep);
      }
      return String(dep);
    }).join('|');
  }, []);
  
  useEffect(() => {
    // Skip effects when dependencies haven't changed
    const depsChanged = isFirstRender.current || 
      dependencies.length !== prevDepsRef.current.length ||
      dependencies.some((dep, i) => dep !== prevDepsRef.current[i]);
    
    if (depsChanged) {
      const cacheKey = getCacheKey(dependencies);
      
      // Check cache first
      if (cache.current.has(cacheKey)) {
        setValue(cache.current.get(cacheKey));
      } else {
        // Start performance measurement
        PerformanceMonitor.start(`optimized-${operationName}`);
        
        // Compute new value
        const newValue = computeExpensiveValue();
        
        // End performance measurement
        PerformanceMonitor.end(`optimized-${operationName}`);
        
        // Update cache and state
        cache.current.set(cacheKey, newValue);
        setValue(newValue);
      }
      
      // Update refs
      prevDepsRef.current = dependencies;
      isFirstRender.current = false;
      
      // Limit cache size to prevent memory issues
      if (cache.current.size > 20) {
        // Delete oldest entry (first key in map)
        const firstKey = cache.current.keys().next().value;
        cache.current.delete(firstKey);
      }
    }
  }, [...dependencies]);
  
  return value;
};

/**
 * Hook for tracking component render performance
 * @param {String} componentName - Name of the component for tracking
 */
export const useRenderPerformance = (componentName) => {
  useEffect(() => {
    const tracker = PerformanceMonitor.trackComponent(componentName);
    
    return () => {
      tracker.end();
    };
  }, [componentName]);
};

/**
 * Hook for deferring expensive operations until after paint
 * @param {Function} callback - Function to run after paint
 * @param {Array} dependencies - Dependencies that should trigger the callback
 */
export const useAfterPaint = (callback, dependencies = []) => {
  useEffect(() => {
    // Use requestIdleCallback if available, otherwise setTimeout
    const handle = 'requestIdleCallback' in window
      ? window.requestIdleCallback(() => callback())
      : setTimeout(() => callback(), 0);
    
    return () => {
      if ('requestIdleCallback' in window) {
        window.cancelIdleCallback(handle);
      } else {
        clearTimeout(handle);
      }
    };
  }, dependencies);
};

/**
 * Hook to detect and prevent expensive re-renders
 * @param {String} componentName - Name of the component
 * @param {Array} props - Props to monitor
 */
export const usePreventExpensiveRenders = (componentName, props = []) => {
  const renderCount = useRef(0);
  const prevProps = useRef(props);
  
  useEffect(() => {
    renderCount.current += 1;
    
    if (renderCount.current > 3 && process.env.NODE_ENV !== 'production') {
      console.warn(`Component ${componentName} has rendered ${renderCount.current} times. Consider memoizing it.`);
      
      // Log which props changed
      props.forEach((prop, index) => {
        if (prevProps.current[index] !== prop) {
          console.warn(`Prop change triggered re-render: ${JSON.stringify(prevProps.current[index])} → ${JSON.stringify(prop)}`);
        }
      });
    }
    
    prevProps.current = props;
  });
};
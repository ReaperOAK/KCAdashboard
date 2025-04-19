// Performance monitoring utility to track metrics
// This helps identify performance bottlenecks in the application

export const PerformanceMonitor = {
  // Store performance marks
  marks: {},
  
  // Start measuring a specific operation
  start: (label) => {
    if (process.env.NODE_ENV !== 'production') return;
    
    const now = performance.now();
    PerformanceMonitor.marks[label] = now;
    console.debug(`⏱️ Start: ${label}`);
    
    // Also use the Performance API for more accurate measurements
    performance.mark(`${label}-start`);
  },
  
  // End measuring a specific operation and log duration
  end: (label) => {
    if (process.env.NODE_ENV !== 'production') return;
    
    const startTime = PerformanceMonitor.marks[label];
    if (!startTime) {
      console.warn(`No start time found for: ${label}`);
      return;
    }
    
    const duration = performance.now() - startTime;
    console.debug(`⏱️ End: ${label} - ${duration.toFixed(2)}ms`);
    
    // Use the Performance API and add to performance timeline
    performance.mark(`${label}-end`);
    performance.measure(label, `${label}-start`, `${label}-end`);
    
    // Report to analytics if duration is concerning
    if (duration > 500) {
      // Consider sending this to your analytics service
      console.warn(`Performance concern: ${label} took ${duration.toFixed(2)}ms`);
    }
    
    delete PerformanceMonitor.marks[label];
    return duration;
  },
  
  // Track a component render time
  trackComponent: (componentName) => {
    if (process.env.NODE_ENV !== 'production') return { end: () => {} };
    
    PerformanceMonitor.start(`render-${componentName}`);
    return {
      end: () => PerformanceMonitor.end(`render-${componentName}`)
    };
  },
  
  // Report vital metrics
  reportVitals: (metric) => {
    if (process.env.NODE_ENV !== 'production') return;
    
    const { name, value } = metric;
    console.debug(`Web Vital: ${name} - ${value}`);
    
    // Could send to analytics service here
    // sendToAnalytics({ metric });
  }
};

export default PerformanceMonitor;
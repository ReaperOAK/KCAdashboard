import { PerformanceMonitor } from './utils/PerformanceMonitor';

const reportWebVitals = onPerfEntry => {
  if (onPerfEntry && onPerfEntry instanceof Function) {
    import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
      // Core Web Vitals
      getCLS(metric => {
        // Cumulative Layout Shift
        PerformanceMonitor.reportVitals(metric);
        onPerfEntry(metric);
        // Alert on poor CLS scores
        if (metric.value > 0.1) {
          console.warn(`High CLS value detected: ${metric.value.toFixed(2)}`);
        }
      });
      
      // First Input Delay
      getFID(metric => {
        PerformanceMonitor.reportVitals(metric);
        onPerfEntry(metric);
        // Alert on poor FID scores
        if (metric.value > 100) {
          console.warn(`High FID value detected: ${metric.value.toFixed(2)}ms`);
        }
      });
      
      // First Contentful Paint
      getFCP(metric => {
        PerformanceMonitor.reportVitals(metric);
        onPerfEntry(metric);
        // Alert on poor FCP scores
        if (metric.value > 1800) {
          console.warn(`Slow FCP detected: ${metric.value.toFixed(2)}ms`);
        }
      });
      
      // Largest Contentful Paint
      getLCP(metric => {
        PerformanceMonitor.reportVitals(metric);
        onPerfEntry(metric);
        // Alert on poor LCP scores
        if (metric.value > 2500) {
          console.warn(`Slow LCP detected: ${metric.value.toFixed(2)}ms`);
        }
      });
      
      // Time to First Byte
      getTTFB(metric => {
        PerformanceMonitor.reportVitals(metric);
        onPerfEntry(metric);
        // Alert on poor TTFB scores
        if (metric.value > 600) {
          console.warn(`Slow TTFB detected: ${metric.value.toFixed(2)}ms`);
        }
      });
    });
  }
};

export default reportWebVitals;

import React from 'react';
/**
 * Animated loading skeleton for batch detail page.
 */
const LoadingSkeleton = () => (
  <div className="min-h-screen bg-background-light p-6 flex items-center justify-center">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent" aria-label="Loading" />
  </div>
);
export default LoadingSkeleton;

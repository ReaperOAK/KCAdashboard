import React from 'react';
/**
 * Animated loading skeleton for batch detail page.
 */

const LoadingSkeleton = () => (
  <div className="min-h-screen bg-background-light p-6 flex items-center justify-center " role="status" aria-label="Loading">
    <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-accent border-opacity-80" />
  </div>
);
export default LoadingSkeleton;

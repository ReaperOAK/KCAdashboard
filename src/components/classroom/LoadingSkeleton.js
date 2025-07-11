import React from 'react';
/**
 * Animated loading skeleton for classroom management page.
 */
const LoadingSkeleton = () => (
  <div className="animate-pulse text-center py-8" role="status" aria-busy="true">
    <div className="h-6 bg-gray-light rounded w-1/3 mx-auto mb-4" />
    <div className="h-4 bg-gray-light rounded w-1/2 mx-auto" />
  </div>
);
export default React.memo(LoadingSkeleton);

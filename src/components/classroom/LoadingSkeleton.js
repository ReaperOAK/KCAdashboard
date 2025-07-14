
import React from 'react';
/**
 * Animated loading skeleton for classroom management page.
 * Uses color tokens, dark mode, and improved accessibility.
 */
const LoadingSkeleton = () => (
  <div
    className="flex flex-col items-center justify-center py-10 animate-pulse"
    role="status"
    aria-busy="true"
    aria-label="Loading content..."
  >
    <div
      className="h-7 w-2/3 max-w-xs bg-gray-light dark:bg-gray-700 rounded mb-4 transition-all duration-300"
      style={{ minWidth: 120 }}
    />
    <div
      className="h-4 w-1/2 max-w-sm bg-gray-light dark:bg-gray-700 rounded transition-all duration-300"
      style={{ minWidth: 80 }}
    />
    <span className="sr-only">Loading...</span>
  </div>
);

export default React.memo(LoadingSkeleton);

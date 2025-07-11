import React from 'react';

/**
 * Animated loading spinner for tournament pages.
 * Accessible and uses color tokens.
 */
const LoadingSpinner = () => (
  <div className="flex flex-col items-center justify-center py-12" role="status" aria-live="polite">
    <div className="animate-spin w-14 h-14 border-4 border-accent border-t-transparent rounded-full mb-4 shadow-lg transition-all duration-200" />
    <span className="text-gray-dark text-lg font-medium">Loading tournaments...</span>
  </div>
);

export default React.memo(LoadingSpinner);

import React from 'react';

const LoadingSpinner = React.memo(() => (
  <div className="flex flex-col items-center justify-center p-8" role="status" aria-live="polite">
    <div className="animate-spin w-12 h-12 border-4 border-accent border-t-transparent rounded-full mb-4 transition-all duration-200" />
    <span className="text-gray-dark">Loading leaderboard data...</span>
  </div>
));

export default LoadingSpinner;

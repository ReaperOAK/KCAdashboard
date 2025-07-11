import React from 'react';

const LoadingSpinner = React.memo(() => (
  <div className="flex flex-col items-center justify-center py-8" role="status" aria-live="polite">
    <div className="animate-spin w-10 h-10 border-4 border-accent border-t-transparent rounded-full mb-4" />
    <span className="text-gray-dark">Loading feedback...</span>
  </div>
));

export default LoadingSpinner;

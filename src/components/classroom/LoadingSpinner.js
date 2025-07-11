import React from 'react';

const LoadingSpinner = React.memo(() => (
  <div className="flex items-center justify-center min-h-screen bg-background-light" role="status" aria-live="polite">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-secondary mx-auto mb-4" aria-label="Loading"></div>
      <p className="text-secondary">Loading classes...</p>
    </div>
  </div>
));

export default LoadingSpinner;

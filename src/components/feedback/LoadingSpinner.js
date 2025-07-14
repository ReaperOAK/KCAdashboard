import React from 'react';


const LoadingSpinner = React.memo(() => (
  <div
    className="flex flex-col items-center justify-center py-10 animate-fade-in"
    role="status"
    aria-live="polite"
    aria-label="Loading feedback..."
  >
    <div className="animate-spin w-12 h-12 border-4 border-accent dark:border-secondary border-t-transparent rounded-full mb-4 shadow-lg" />
    <span className="text-accent dark:text-secondary font-medium">Loading feedback...</span>
    <span className="sr-only">Loading...</span>
  </div>
));

export default LoadingSpinner;

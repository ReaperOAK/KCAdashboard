import React from 'react';
/**
 * Beautiful, accessible loading spinner for classroom pages.
 * Uses color tokens, dark mode, and responsive layout.
 */
const LoadingSpinner = React.memo(() => (
  <div
    className="flex items-center justify-center min-h-[60vh] bg-background-light dark:bg-background-dark px-4"
    role="status"
    aria-live="polite"
    aria-label="Loading content..."
  >
    <div className="flex flex-col items-center">
      <div
        className="animate-spin rounded-full h-14 w-14 border-t-4 border-b-4 border-accent dark:border-secondary mb-4 shadow-lg"
        aria-label="Loading"
      ></div>
      <p className="text-accent dark:text-secondary text-lg font-medium tracking-wide">Loading classes...</p>
      <span className="sr-only">Loading...</span>
    </div>
  </div>
));

export default LoadingSpinner;

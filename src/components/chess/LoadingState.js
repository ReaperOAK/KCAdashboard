
import React from 'react';

/**
 * LoadingState
 * Beautiful, accessible loading panel for chess features.
 * - Responsive, centered card/panel
 * - Spinner animation
 * - Accessible label
 * - Uses Tailwind color tokens and design system
 */
const LoadingState = React.memo(function LoadingState() {
  return (
    <section
      className="max-w-2xl mx-auto px-4 py-10 flex flex-col items-center justify-center min-h-[40vh]"
      aria-label="Loading chess data"
      role="status"
      tabIndex={-1}
    >
      <div className="bg-background-light dark:bg-background-dark border border-gray-light shadow-md rounded-xl flex flex-col items-center justify-center w-full py-10">
        <span className="sr-only">Loading...</span>
        <div
          className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-accent mb-6"
          aria-hidden="true"
        ></div>
        <div className="text-primary text-lg font-semibold tracking-wide mb-1">Loading...</div>
        <div className="text-gray-dark text-sm">Please wait while we fetch chess data.</div>
      </div>
    </section>
  );
});

export default LoadingState;

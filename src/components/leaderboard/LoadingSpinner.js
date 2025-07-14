import React from 'react';

/**
 * LoadingSpinner: Shows a beautiful, accessible loading indicator.
 * Single responsibility: Only displays a spinner and message.
 */
const LoadingSpinner = React.memo(function LoadingSpinner() {
  return (
    <div
      className="flex flex-col items-center justify-center w-full p-8 sm:p-12 bg-background-light rounded-xl shadow-md "
      role="status"
      aria-live="polite"
      tabIndex={-1}
    >
      {/* Spinner Icon (SVG for accessibility and polish) */}
      <span className="relative flex h-14 w-14 mb-4">
        <span className="absolute inline-flex h-full w-full rounded-full bg-accent opacity-20 animate-ping" />
        <svg
          className="animate-spin h-14 w-14 text-accent drop-shadow-lg"
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <circle
            className="opacity-30"
            cx="24"
            cy="24"
            r="20"
            stroke="currentColor"
            strokeWidth="6"
          />
          <path
            d="M44 24c0-11.046-8.954-20-20-20"
            stroke="currentColor"
            strokeWidth="6"
            strokeLinecap="round"
            className="text-accent"
          />
        </svg>
      </span>
      <span className="text-base sm:text-lg text-gray-dark font-medium mt-1">Loading leaderboard data...</span>
    </div>
  );
});

export default LoadingSpinner;

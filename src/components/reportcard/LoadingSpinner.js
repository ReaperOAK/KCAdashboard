import React from 'react';

/**
 * LoadingSpinner: Pure, focused loading indicator component.
 * - Beautiful, accessible, responsive UI
 * - Uses Tailwind color tokens and animation
 * - Handles only loading display (single responsibility)
 */
const LoadingSpinner = React.memo(function LoadingSpinner({ label = 'Loading...', className = '' }) {
  return (
    <div
      className={`flex flex-col items-center justify-center py-8 w-full  ${className}`}
      role="status"
      aria-live="polite"
      tabIndex={-1}
    >
      <span className="relative flex h-12 w-12 mb-4">
        <span className="absolute inline-flex h-full w-full rounded-full bg-accent opacity-30 animate-ping" />
        <span className="relative inline-flex rounded-full">
          <svg className="w-12 h-12 animate-spin text-accent" viewBox="0 0 48 48" fill="none" aria-hidden="true">
            <circle className="opacity-20" cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="6" />
            <path className="opacity-80" fill="currentColor" d="M44 24c0-11.046-8.954-20-20-20v6c7.732 0 14 6.268 14 14h6z" />
          </svg>
        </span>
      </span>
      <span className="text-base sm:text-lg font-medium text-gray-dark dark:text-text-light text-center select-none">
        {label}
      </span>
    </div>
  );
});

export default LoadingSpinner;

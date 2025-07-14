
import React from 'react';

/**
 * LoadingSpinner: Beautiful, accessible loading spinner for tournament pages.
 * - Uses Tailwind color tokens from the design system.
 * - Responsive, visually clear, and focused (single responsibility).
 */
const LoadingSpinner = React.memo(function LoadingSpinner({ label = 'Loading tournaments...', className = '' }) {
  return (
    <div
      className={[
        'flex flex-col items-center justify-center py-12',
        className,
      ].join(' ')}
      role="status"
      aria-live="polite"
      tabIndex={0}
    >
      {/* SVG spinner for best a11y and animation */}
      <svg
        className="animate-spin w-14 h-14 text-accent mb-4 drop-shadow-lg"
        viewBox="0 0 48 48"
        fill="none"
        aria-hidden="true"
        focusable="false"
      >
        <circle
          className="opacity-20"
          cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="6"
        />
        <path
          className="opacity-80"
          fill="currentColor"
          d="M44 24c0-11.046-8.954-20-20-20v6c7.732 0 14 6.268 14 14h6z"
        />
      </svg>
      <span className="text-gray-dark text-base sm:text-lg font-medium select-none">
        {label}
      </span>
    </div>
  );
});

export default LoadingSpinner;

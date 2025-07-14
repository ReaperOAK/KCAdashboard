import React from 'react';

/**
 * ErrorState: Displays a visually appealing, accessible error message with icon.
 * Props:
 *   - message: string (required)
 */
const ErrorState = React.memo(function ErrorState({ message }) {
  return (
    <div
      className="w-full max-w-md mx-auto p-6 sm:p-8 bg-error border border-error rounded-xl shadow-lg flex flex-col items-center gap-3 "
      role="alert"
      aria-live="assertive"
      tabIndex={-1}
    >
      {/* Error Icon (Lucide or Heroicons, fallback to SVG) */}
      <svg
        className="w-10 h-10 mb-2 text-white drop-shadow-lg"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        viewBox="0 0 24 24"
        aria-hidden="true"
        focusable="false"
      >
        <circle cx="12" cy="12" r="10" className="stroke-white/80" />
        <path d="M12 8v4m0 4h.01" className="stroke-white" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span className="text-lg sm:text-xl font-semibold text-white drop-shadow-sm">
        {message}
      </span>
      {/* Optional: Add a retry or go back button via children or prop for extensibility */}
    </div>
  );
});

export default ErrorState;

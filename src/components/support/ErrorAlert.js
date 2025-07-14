
import React from 'react';

/**
 * ErrorAlert component: Shows a beautiful, accessible, responsive error alert UI.
 * Only responsibility: Display error alert with icon and message.
 *
 * Props:
 *   - message: string (required)
 *   - icon?: ReactNode (optional, for custom icon)
 */
const ErrorAlert = React.memo(function ErrorAlert({ message, icon }) {
  return (
    <div
      className="flex items-center w-full max-w-2xl mx-auto px-4 py-3 sm:px-6 sm:py-4 rounded-lg bg-error border-l-4 border-red-800 shadow-md mb-4 "
      role="alert"
      aria-live="assertive"
      tabIndex={-1}
    >
      <span className="flex-shrink-0 mr-3">
        {icon ? (
          <span className="text-white text-xl sm:text-2xl" aria-hidden="true">{icon}</span>
        ) : (
          <svg
            className="w-6 h-6 sm:w-7 sm:h-7 text-white"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v2m0 4h.01M21 12A9 9 0 1 1 3 12a9 9 0 0 1 18 0Z"
            />
          </svg>
        )}
      </span>
      <span className="text-white text-base sm:text-lg font-medium flex-1">
        {message}
      </span>
    </div>
  );
});

export default ErrorAlert;

import React from 'react';

/**
 * ErrorState: Pure, focused error display component.
 * - Beautiful, accessible, responsive UI
 * - Uses Tailwind color tokens and animation
 * - Handles only error display (single responsibility)
 */
const ErrorState = React.memo(function ErrorState({ message, className = '' }) {
  return (
    <div
      className={`flex flex-col items-center justify-center bg-error/10 border border-error text-error rounded-lg px-4 py-5 sm:px-6 sm:py-6 shadow-md animate-fade-in ${className}`}
      role="alert"
      aria-live="assertive"
      tabIndex={-1}
    >
      <svg
        className="w-8 h-8 mb-2 text-error animate-bounce"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
        focusable="false"
      >
        <circle cx="12" cy="12" r="10" strokeWidth="2" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01" />
      </svg>
      <span className="text-base sm:text-lg font-medium text-error break-words max-w-full">
        {message}
      </span>
    </div>
  );
});

export default ErrorState;

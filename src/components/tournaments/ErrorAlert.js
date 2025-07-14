
import React from 'react';

/**
 * ErrorAlert: Shows a beautiful, accessible error alert with icon and animation.
 * - Uses Tailwind color tokens from the design system.
 * - Responsive, visually clear, and focused on a11y.
 * - Only displays error messages (single responsibility).
 */
const ErrorAlert = React.memo(function ErrorAlert({ message, className = '' }) {
  if (!message) return null;
  return (
    <div
      className={[
        'flex items-start gap-3 bg-error border-l-4 border-error text-white px-4 py-3 rounded-lg mb-6 shadow-md animate-fade-in',
        'sm:px-6 sm:py-4',
        'transition-all duration-200',
        className,
      ].join(' ')}
      role="alert"
      aria-live="assertive"
      tabIndex={0}
    >
      {/* Icon: Lucide/heroicons exclamation-triangle (SVG inline for no deps) */}
      <svg
        className="w-6 h-6 flex-shrink-0 text-white opacity-90 mt-0.5"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        viewBox="0 0 24 24"
        aria-hidden="true"
        focusable="false"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M21 19a2 2 0 0 1-1.72 1H4.72A2 2 0 0 1 3 19l8-14a2 2 0 0 1 3.46 0l8 14z" />
      </svg>
      <div className="flex-1 min-w-0">
        <span className="block font-semibold text-base sm:text-lg leading-snug">
          Error
        </span>
        <span className="block text-sm sm:text-base text-white/90 mt-0.5">
          {message}
        </span>
      </div>
    </div>
  );
});

export default ErrorAlert;

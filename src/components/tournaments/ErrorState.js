
import React from 'react';

/**
 * ErrorState: Prominent, beautiful error state for empty/error screens.
 * - Uses Tailwind color tokens from the design system.
 * - Responsive, accessible, and visually clear.
 * - Only displays error state (single responsibility).
 */
const ErrorState = React.memo(function ErrorState({ message, className = '' }) {
  if (!message) return null;
  return (
    <div
      className={[
        'flex flex-col items-center justify-center bg-error/10 border-2 border-error rounded-2xl p-6 sm:p-8 text-center shadow-lg ',
        'max-w-xl mx-auto my-8',
        'transition-all duration-200',
        className,
      ].join(' ')}
      role="alert"
      aria-live="assertive"
      tabIndex={0}
    >
      {/* Icon: Exclamation triangle (SVG, no external dep) */}
      <svg
        className="w-10 h-10 text-error mb-3"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        viewBox="0 0 24 24"
        aria-hidden="true"
        focusable="false"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M21 19a2 2 0 0 1-1.72 1H4.72A2 2 0 0 1 3 19l8-14a2 2 0 0 1 3.46 0l8 14z" />
      </svg>
      <span className="block text-error text-lg sm:text-xl font-semibold leading-snug">
        {message}
      </span>
    </div>
  );
});

export default ErrorState;

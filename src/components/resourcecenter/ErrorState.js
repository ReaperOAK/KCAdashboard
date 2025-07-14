
import React, { useMemo } from 'react';

/**
 * ErrorState: Beautiful, responsive, single-responsibility error state
 * - Shows a message and icon for error states
 * - Responsive, color tokens, accessible, mobile friendly
 */
const ErrorState = React.memo(function ErrorState({ message }) {
  // Memoize message for performance
  const msg = useMemo(() => message || 'An unexpected error occurred.', [message]);

  return (
    <section className="flex flex-col items-center justify-center py-6 px-4 bg-error/10 border border-error rounded-2xl shadow-md w-full max-w-xl mx-auto animate-fade-in" role="alert" aria-live="assertive">
      <span className="mb-2 text-4xl md:text-5xl text-error select-none" aria-hidden>⚠️</span>
      <p className="text-base md:text-lg text-error font-semibold text-center">{msg}</p>
    </section>
  );
});

export default ErrorState;

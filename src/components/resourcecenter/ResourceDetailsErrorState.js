
import React, { useMemo } from 'react';

/**
 * ResourceDetailsErrorState: Beautiful, responsive, single-responsibility error state for resource details
 * - Shows a message and icon for error state
 * - Responsive, color tokens, accessible, mobile friendly
 */
const ResourceDetailsErrorState = React.memo(function ResourceDetailsErrorState({ message, onBack }) {
  // Memoize message for performance
  const msg = useMemo(() => message || 'An unexpected error occurred.', [message]);

  return (
    <section className="flex flex-col items-center justify-center py-10 px-4 bg-error/10 border border-error rounded-2xl shadow-md w-full max-w-xl mx-auto  text-center mb-6" role="alert" aria-live="assertive">
      <span className="mb-4 text-5xl md:text-6xl text-error select-none" aria-hidden>⚠️</span>
      <p className="text-lg md:text-xl text-error font-semibold mb-2">{msg}</p>
      <button
        onClick={onBack}
        className="mt-2 px-5 py-2 bg-primary text-white rounded-lg hover:bg-secondary focus:ring-2 focus:ring-accent focus:outline-none transition-all duration-200 font-medium text-base"
        aria-label="Back to Resources"
      >
        Back to Resources
      </button>
    </section>
  );
});

export default ResourceDetailsErrorState;

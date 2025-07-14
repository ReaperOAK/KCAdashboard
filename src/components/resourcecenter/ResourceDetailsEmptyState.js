
import React, { useMemo } from 'react';

/**
 * ResourceDetailsEmptyState: Beautiful, responsive, single-responsibility empty state for resource details
 * - Shows a message and icon for missing resource
 * - Responsive, color tokens, accessible, mobile friendly
 */
const ResourceDetailsEmptyState = React.memo(function ResourceDetailsEmptyState({ onBack }) {
  // Memoize message for performance
  const message = useMemo(() => 'Resource not found', []);

  return (
    <section className="flex flex-col items-center justify-center py-10 px-4 bg-background-light dark:bg-background-dark rounded-2xl shadow-md border border-gray-light w-full max-w-xl mx-auto  text-center">
      <span className="mb-4 text-5xl md:text-6xl text-gray-dark/40 select-none" aria-hidden>🔍</span>
      <p className="text-lg md:text-xl text-gray-dark font-semibold mb-2">{message}</p>
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

export default ResourceDetailsEmptyState;

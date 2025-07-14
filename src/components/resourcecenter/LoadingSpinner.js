
import React, { useMemo } from 'react';

/**
 * LoadingSpinner: Beautiful, responsive, single-responsibility loading spinner
 * - Shows a spinner and label for loading states
 * - Responsive, color tokens, accessible, mobile friendly
 */
const LoadingSpinner = React.memo(function LoadingSpinner({ label = 'Loading resources...' }) {
  // Memoize label for performance
  const displayLabel = useMemo(() => label, [label]);

  return (
    <section className="flex flex-col items-center justify-center py-10 px-4 bg-background-light dark:bg-background-dark rounded-2xl shadow-md w-full max-w-xs mx-auto " role="status" aria-live="polite">
      <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-accent mx-auto mb-2" />
      <p className="mt-1 text-accent text-base font-medium text-center">{displayLabel}</p>
    </section>
  );
});

export default LoadingSpinner;

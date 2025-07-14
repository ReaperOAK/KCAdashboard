import React from 'react';

// Enhanced LoadingSkeleton: beautiful, responsive, accessible, and focused
const LoadingSkeleton = React.memo(function LoadingSkeleton() {
  return (
    <div className="flex justify-center items-center min-h-64 w-full" role="status" aria-live="polite">
      <span className="relative flex h-16 w-16">
        {/* Dual color spinner */}
        <span className="absolute inset-0 rounded-full bg-gradient-to-tr from-accent via-secondary to-primary opacity-20 blur-sm" />
        <span className="animate-spin rounded-full h-16 w-16 border-4 border-accent border-t-transparent border-b-secondary shadow-lg" />
        <span className="sr-only">Loading...</span>
      </span>
    </div>
  );
});

export default LoadingSkeleton;

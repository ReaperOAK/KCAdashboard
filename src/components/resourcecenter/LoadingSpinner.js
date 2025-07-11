import React from 'react';

const LoadingSpinner = React.memo(function LoadingSpinner({ label = 'Loading resources...' }) {
  return (
    <div className="text-center py-8" role="status" aria-live="polite">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-secondary mx-auto" />
      <p className="mt-2 text-secondary">{label}</p>
    </div>
  );
});

export default LoadingSpinner;

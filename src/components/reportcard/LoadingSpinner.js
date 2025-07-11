import React from 'react';

const LoadingSpinner = React.memo(({ label = 'Loading...' }) => (
  <div className="flex flex-col items-center justify-center py-8" role="status" aria-live="polite">
    <div className="animate-spin w-10 h-10 border-4 border-secondary border-t-transparent rounded-full mb-4 transition-all duration-200" />
    <span className="text-gray-dark text-base font-medium">{label}</span>
  </div>
));

export default LoadingSpinner;

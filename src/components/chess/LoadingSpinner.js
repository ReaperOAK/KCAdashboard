import React from 'react';

const LoadingSpinner = React.memo(({ label }) => (
  <section
    className="flex flex-col items-center justify-center min-h-80 py-8 px-4 sm:px-8 bg-background-light dark:bg-background-dark border border-gray-light shadow-md rounded-xl text-primary font-bold text-lg transition-all duration-200"
    role="status"
    aria-live="polite"
  >
    <div className="flex items-center justify-center mb-3">
      <svg className="animate-spin h-10 w-10 text-accent mr-3" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
      </svg>
    </div>
    <span className="text-lg sm:text-xl font-semibold text-primary text-center">{label}</span>
  </section>
));

export default LoadingSpinner;

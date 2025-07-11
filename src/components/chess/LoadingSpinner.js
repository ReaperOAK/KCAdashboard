import React from 'react';

const LoadingSpinner = React.memo(({ label }) => (
  <section className="flex justify-center items-center min-h-96 text-primary font-bold text-lg" role="status" aria-live="polite">
    <svg className="animate-spin h-8 w-8 text-accent mr-3" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
    </svg>
    <span>{label}</span>
  </section>
));

export default LoadingSpinner;

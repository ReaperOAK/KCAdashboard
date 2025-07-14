import React from 'react';
/**
 * Error alert for batch detail page.
 */

const ErrorAlert = ({ error, onBack }) => (
  <div className="min-h-screen flex items-center justify-center bg-background-light p-4">
    <div className="w-full max-w-md mx-auto bg-error/10 text-error border border-error p-6 rounded-xl shadow-md flex flex-col items-center " role="alert">
      <svg className="w-8 h-8 mb-2 text-error" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12A9 9 0 1 1 3 12a9 9 0 0 1 18 0Z" />
      </svg>
      <div className="text-lg font-semibold text-error mb-2 text-center">Error</div>
      <div className="text-base text-error text-center mb-4">{error}</div>
      <button
        onClick={onBack}
        className="px-4 py-2 bg-accent text-white rounded-lg shadow hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 transition-all duration-200 w-full sm:w-auto"
      >
        Back to Batches
      </button>
    </div>
  </div>
);
export default ErrorAlert;

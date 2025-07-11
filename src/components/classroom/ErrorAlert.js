import React from 'react';
/**
 * Error alert for classroom management page.
 */
const ErrorAlert = ({ message, onClose }) => (
  <div className="bg-error border border-error text-white rounded-lg px-4 py-3 flex items-center justify-between mb-4" role="alert" aria-live="assertive">
    <span>{message}</span>
    {onClose && (
      <button onClick={onClose} aria-label="Dismiss error" className="ml-4 text-white hover:text-gray-light focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-error rounded">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
      </button>
    )}
  </div>
);
export default React.memo(ErrorAlert);

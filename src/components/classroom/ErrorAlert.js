import React from 'react';
/**
 * Error alert for classroom management page.
 */
const ErrorAlert = ({ message, onClose }) => (
  <div
    className="bg-red-700 border border-red-800 text-white rounded-xl px-4 py-3 flex items-center justify-between gap-3 mb-4 shadow-md animate-fade-in"
    role="alert"
    aria-live="assertive"
  >
    <div className="flex items-center gap-2">
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
      <span className="font-medium text-base break-words">{message}</span>
    </div>
    {onClose && (
      <button
        onClick={onClose}
        aria-label="Dismiss error"
        className="ml-2 p-1 rounded-full text-white hover:bg-red-800 hover:text-gray-light focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-red-800 transition-all duration-200"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
      </button>
    )}
  </div>
);
export default React.memo(ErrorAlert);

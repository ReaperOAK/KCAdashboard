import React from 'react';
/**
 * Not found state for batch detail page.
 */

const NotFound = ({ onBack }) => (
  <div className="min-h-screen flex items-center justify-center bg-background-light p-4">
    <div className="w-full max-w-md mx-auto bg-white p-8 rounded-xl shadow-md flex flex-col items-center ">
      <svg className="w-12 h-12 mb-3 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12A9 9 0 1 1 3 12a9 9 0 0 1 18 0Z" />
      </svg>
      <p className="text-xl font-semibold text-primary mb-2 text-center">Batch not found</p>
      <p className="text-gray-dark text-center mb-4">The batch you are looking for does not exist or has been removed.</p>
      <button
        onClick={onBack}
        className="px-4 py-2 bg-accent text-white rounded-lg shadow hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 transition-all duration-200 w-full sm:w-auto"
      >
        Back to Batches
      </button>
    </div>
  </div>
);
export default NotFound;

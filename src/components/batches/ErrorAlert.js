import React from 'react';
/**
 * Error alert for batch detail page.
 */
const ErrorAlert = ({ error, onBack }) => (
  <div className="min-h-screen bg-background-light p-6">
    <div className="bg-error/10 text-error border border-error p-4 rounded-lg" role="alert">{error}</div>
    <div className="mt-4">
      <button onClick={onBack} className="px-4 py-2 bg-secondary text-white rounded-lg hover:bg-accent focus:outline-none focus:ring-2 focus:ring-accent transition-all duration-200">Back to Batches</button>
    </div>
  </div>
);
export default ErrorAlert;

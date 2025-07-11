import React from 'react';
/**
 * Not found state for batch detail page.
 */
const NotFound = ({ onBack }) => (
  <div className="min-h-screen bg-background-light p-6">
    <div className="bg-white p-6 rounded-xl">
      <p>Batch not found</p>
      <button onClick={onBack} className="mt-4 px-4 py-2 bg-secondary text-white rounded-lg hover:bg-accent focus:outline-none focus:ring-2 focus:ring-accent transition-all duration-200">Back to Batches</button>
    </div>
  </div>
);
export default NotFound;

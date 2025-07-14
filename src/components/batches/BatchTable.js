import React from 'react';
import BatchTableRow from './BatchTableRow';

/**
 * BatchTable - Table for displaying batches.
 * @param {Object} props
 * @param {Array} props.batches
 * @param {function} props.onEdit
 */

const BatchTable = React.memo(function BatchTable({ batches, onEdit }) {
  if (!batches.length) {
    return <div className="text-center py-8 text-gray-dark" aria-live="polite">No batches found.</div>;
  }
  return (
    <div
      className="bg-background-light dark:bg-background-dark rounded-xl shadow-lg overflow-x-auto border border-gray-light transition-all duration-300 animate-fade-in"
      role="region"
      aria-label="Batch Table"
      tabIndex={0}
    >
      <table className="min-w-full divide-y divide-gray-light" role="table">
        <thead className="bg-primary">
          <tr>
            <th className="px-2 py-2 sm:px-4 sm:py-3 text-left text-xs sm:text-sm font-semibold text-white uppercase tracking-wide">Name</th>
            <th className="px-2 py-2 sm:px-4 sm:py-3 text-left text-xs sm:text-sm font-semibold text-white uppercase tracking-wide">Teacher</th>
            <th className="px-2 py-2 sm:px-4 sm:py-3 text-left text-xs sm:text-sm font-semibold text-white uppercase tracking-wide">Level</th>
            <th className="px-2 py-2 sm:px-4 sm:py-3 text-left text-xs sm:text-sm font-semibold text-white uppercase tracking-wide">Students</th>
            <th className="px-2 py-2 sm:px-4 sm:py-3 text-left text-xs sm:text-sm font-semibold text-white uppercase tracking-wide">Status</th>
            <th className="px-2 py-2 sm:px-4 sm:py-3 text-left text-xs sm:text-sm font-semibold text-white uppercase tracking-wide">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-background-light divide-y divide-gray-light">
          {batches.map((batch, idx) => (
            <tr
              key={batch.id}
              className="hover:bg-gray-light/60 focus-within:bg-accent/10 transition-colors duration-200"
              tabIndex={0}
              role="row"
            >
              <BatchTableRow batch={batch} onEdit={onEdit} />
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
});

export default BatchTable;

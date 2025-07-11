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
    <div className="bg-background-light dark:bg-background-dark rounded-xl shadow-md overflow-x-auto border border-gray-light transition-all duration-200">
      <table className="min-w-full divide-y divide-gray-light">
        <thead className="bg-primary">
          <tr>
            <th className="px-2 py-2 sm:px-4 sm:py-3 text-left text-sm font-semibold text-white uppercase">Name</th>
            <th className="px-2 py-2 sm:px-4 sm:py-3 text-left text-sm font-semibold text-white uppercase">Teacher</th>
            <th className="px-2 py-2 sm:px-4 sm:py-3 text-left text-sm font-semibold text-white uppercase">Level</th>
            <th className="px-2 py-2 sm:px-4 sm:py-3 text-left text-sm font-semibold text-white uppercase">Students</th>
            <th className="px-2 py-2 sm:px-4 sm:py-3 text-left text-sm font-semibold text-white uppercase">Status</th>
            <th className="px-2 py-2 sm:px-4 sm:py-3 text-left text-sm font-semibold text-white uppercase">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-background-light divide-y divide-gray-light">
          {batches.map((batch) => (
            <BatchTableRow key={batch.id} batch={batch} onEdit={onEdit} />
          ))}
        </tbody>
      </table>
    </div>
  );
});

export default BatchTable;

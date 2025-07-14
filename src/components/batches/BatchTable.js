
import React from 'react';
import BatchTableRow from './BatchTableRow';
import { FileWarning, PlusCircle } from 'lucide-react';

/**
 * BatchTable - Table for displaying batches.
 * @param {Object} props
 * @param {Array} props.batches
 * @param {function} props.onEdit
 */

const BatchTable = React.memo(function BatchTable({ batches, onEdit }) {
  if (!batches.length) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-gray-dark animate-fade-in" aria-live="polite">
        <FileWarning className="w-12 h-12 text-gray-light mb-2" aria-hidden="true" />
        <div className="text-lg font-semibold mb-1">No batches found</div>
        <div className="text-sm text-gray-dark mb-4">You haven't created any batches yet.</div>
        <button
          onClick={() => onEdit(null)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-lg shadow hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-accent transition-all duration-200"
        >
          <PlusCircle className="w-5 h-5" /> Create New Batch
        </button>
      </div>
    );
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
              className="hover:bg-accent/10 focus-within:bg-accent/20 transition-colors duration-200 group"
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

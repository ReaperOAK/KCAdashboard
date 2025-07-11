import React from 'react';

/**
 * BulkActionsBar - Shows bulk action buttons for selected users.
 * @param {Object} props
 * @param {number} props.selectedCount
 * @param {function} props.onActivate
 * @param {function} props.onDeactivate
 * @param {function} props.onDelete
 */
const BulkActionsBar = React.memo(function BulkActionsBar({ selectedCount, onActivate, onDeactivate, onDelete }) {
  return (
    <div className="mb-4 p-4 bg-background-light border border-gray-light rounded-xl shadow-md transition-all duration-200" role="region" aria-label="Bulk actions">
      <h3 className="text-sm font-medium text-primary">{selectedCount} users selected</h3>
      <div className="mt-2 flex gap-2">
        <button
          type="button"
          onClick={onActivate}
          className="px-3 py-1 text-sm text-white bg-green-600 rounded hover:bg-green-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500 transition-all duration-200"
        >
          Activate
        </button>
        <button
          type="button"
          onClick={onDeactivate}
          className="px-3 py-1 text-sm text-white bg-yellow-600 rounded hover:bg-yellow-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500 transition-all duration-200"
        >
          Deactivate
        </button>
        <button
          type="button"
          onClick={onDelete}
          className="px-3 py-1 text-sm text-white bg-red-600 rounded hover:bg-red-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 transition-all duration-200"
        >
          Delete
        </button>
      </div>
    </div>
  );
});

export default BulkActionsBar;

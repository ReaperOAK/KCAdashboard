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
    <div className="mb-4 p-3 sm:p-4 bg-background-light border border-gray-light rounded-xl shadow-md transition-all duration-200 w-full" role="region" aria-label="Bulk actions">
      <h3 className="text-base font-semibold text-text-dark mb-2">{selectedCount} user{selectedCount !== 1 ? 's' : ''} selected</h3>
      <div className="flex flex-col sm:flex-row gap-2 w-full">
        <button
          type="button"
          onClick={onActivate}
          className="flex-1 px-3 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-secondary focus:outline-none focus-visible:ring-2 focus-visible:ring-accent transition-all duration-200"
          aria-label="Activate selected users"
        >
          Activate
        </button>
        <button
          type="button"
          onClick={onDeactivate}
          className="flex-1 px-3 py-2 text-sm font-medium text-white bg-warning hover:bg-accent rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-accent transition-all duration-200"
          aria-label="Deactivate selected users"
        >
          Deactivate
        </button>
        <button
          type="button"
          onClick={onDelete}
          className="flex-1 px-3 py-2 text-sm font-medium text-white bg-highlight hover:bg-red-700 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-accent transition-all duration-200"
          aria-label="Delete selected users"
        >
          Delete
        </button>
      </div>
    </div>
  );
});

export default BulkActionsBar;

import React from 'react';

/**
 * Sortable table header for quiz history table.
 * @param {Object} props
 */
const SortableTh = React.memo(function SortableTh({ label, sortKey, sortBy, sortOrder, onSort }) {
  return (
    <th
      className="py-3 px-4 text-left cursor-pointer select-none hover:bg-gray-100"
      onClick={() => onSort(sortKey)}
      tabIndex={0}
      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') onSort(sortKey); }}
      aria-sort={sortBy === sortKey ? (sortOrder === 'asc' ? 'ascending' : 'descending') : 'none'}
      scope="col"
    >
      <div className="flex items-center">
        {label}
        {sortBy === sortKey && (
          <span className="ml-1">{sortOrder === 'asc' ? '↑' : '↓'}</span>
        )}
      </div>
    </th>
  );
});

export default SortableTh;

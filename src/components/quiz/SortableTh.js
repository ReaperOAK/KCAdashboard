
import React from 'react';

/**
 * SortableTh: Beautiful, accessible, and responsive sortable table header for quiz tables.
 */
const SortableTh = React.memo(function SortableTh({ label, sortKey, sortBy, sortOrder, onSort }) {
  const isActive = sortBy === sortKey;
  const sortIcon = isActive ? (
    <span
      className={`ml-1 text-xs font-bold ${sortOrder === 'asc' ? 'text-accent' : 'text-highlight'}`}
      aria-label={sortOrder === 'asc' ? 'Sorted ascending' : 'Sorted descending'}
    >
      {sortOrder === 'asc' ? '▲' : '▼'}
    </span>
  ) : null;
  return (
    <th
      className="py-2 px-3 sm:py-3 sm:px-4 text-left cursor-pointer select-none bg-primary text-white text-xs sm:text-sm uppercase tracking-wide transition-colors focus-within:bg-accent/20 hover:bg-accent/10 outline-none border-b border-gray-dark"
      onClick={() => onSort(sortKey)}
      tabIndex={0}
      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') onSort(sortKey); }}
      aria-sort={isActive ? (sortOrder === 'asc' ? 'ascending' : 'descending') : 'none'}
      scope="col"
      role="columnheader button"
    >
      <span className="flex items-center gap-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent">
        {label}
        {sortIcon}
      </span>
    </th>
  );
});

export default SortableTh;


import React from 'react';

/**
 * FilterExportBar: Filter dropdown and export button for tournament lists.
 * - Uses Tailwind color tokens from the design system.
 * - Responsive, beautiful, accessible, and focused (single responsibility).
 */
const FilterExportBar = React.memo(function FilterExportBar({ filterStatus, onFilterChange, onExport, exportDisabled, className = '' }) {
  return (
    <div
      className={[
        'flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4',
        className,
      ].join(' ')}
    >
      <div className="flex items-center gap-2">
        <label htmlFor="filter-status" className="text-sm font-medium text-text-dark">Filter by status:</label>
        <select
          id="filter-status"
          value={filterStatus}
          onChange={onFilterChange}
          className="border border-gray-light rounded-md px-2 py-1 bg-background-light text-text-dark focus:ring-2 focus:ring-accent focus:outline-none transition-all duration-200"
          aria-label="Filter registrations by payment status"
        >
          <option value="all">All</option>
          <option value="pending">Pending</option>
          <option value="completed">Completed</option>
          <option value="refunded">Refunded</option>
        </select>
      </div>
      <button
        type="button"
        onClick={onExport}
        className="inline-flex items-center gap-2 px-4 py-2 bg-success text-white rounded-lg shadow hover:bg-green-700 focus:ring-2 focus:ring-offset-2 focus:ring-success disabled:bg-gray-dark disabled:text-gray-light transition-all duration-200 font-semibold text-sm sm:text-base"
        disabled={exportDisabled}
        aria-disabled={exportDisabled}
      >
        {/* Download icon (SVG, no external dep) */}
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2M7 10l5 5m0 0l5-5m-5 5V4" /></svg>
        Export to CSV
      </button>
    </div>
  );
});

export default FilterExportBar;

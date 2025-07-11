import React from 'react';

const FilterExportBar = React.memo(({ filterStatus, onFilterChange, onExport, exportDisabled }) => (
  <div className="flex flex-col md:flex-row md:justify-between gap-2 mb-4">
    <div className="flex items-center gap-2">
      <label htmlFor="filter-status" className="text-sm font-medium">Filter by status:</label>
      <select
        id="filter-status"
        value={filterStatus}
        onChange={onFilterChange}
        className="border border-gray-light rounded-md px-2 py-1 focus:ring-2 focus:ring-accent focus:outline-none"
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
      className="px-4 py-2 bg-success text-white rounded-lg hover:bg-green-700 focus:ring-2 focus:ring-offset-2 focus:ring-success disabled:bg-gray-dark disabled:text-gray-light transition-all duration-200"
      disabled={exportDisabled}
      aria-disabled={exportDisabled}
    >
      Export to CSV
    </button>
  </div>
));

export default FilterExportBar;

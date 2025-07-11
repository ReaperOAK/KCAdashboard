import React, { useMemo } from 'react';
import { FaFilter } from 'react-icons/fa';

/**
 * Filter bar for quiz history.
 * @param {Object} props
 */
const FilterBar = React.memo(function FilterBar({ filter, onFilterChange }) {
  const filterOptions = useMemo(() => [
    { key: 'all', label: 'All Quizzes', active: 'bg-secondary text-white', inactive: 'bg-gray-light text-primary hover:bg-gray-200' },
    { key: 'beginner', label: 'Beginner', active: 'bg-green-600 text-white', inactive: 'bg-green-100 text-green-800 hover:bg-green-200' },
    { key: 'intermediate', label: 'Intermediate', active: 'bg-yellow-600 text-white', inactive: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200' },
    { key: 'advanced', label: 'Advanced', active: 'bg-red-600 text-white', inactive: 'bg-red-100 text-red-800 hover:bg-red-200' },
    { key: 'passed', label: 'Passed Only', active: 'bg-secondary text-white', inactive: 'bg-blue-100 text-blue-800 hover:bg-blue-200' },
  ], []);
  return (
    <div className="bg-white rounded-lg shadow mb-6">
      <div className="p-4 border-b flex items-center">
        <FaFilter className="text-secondary mr-2" aria-hidden="true" />
        <h2 className="text-lg font-semibold">Filters</h2>
      </div>
      <div className="p-4 flex flex-wrap gap-3">
        {filterOptions.map(opt => (
          <button
            key={opt.key}
            type="button"
            onClick={() => onFilterChange(opt.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-accent transition-colors ${filter === opt.key ? opt.active : opt.inactive}`}
            aria-pressed={filter === opt.key}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
});

export default FilterBar;

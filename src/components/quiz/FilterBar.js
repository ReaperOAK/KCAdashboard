
import React, { useMemo } from 'react';
import { FaFilter } from 'react-icons/fa';

/**
 * FilterBar: Beautiful, accessible, responsive filter bar for quiz history.
 */
const FilterBar = React.memo(function FilterBar({ filter, onFilterChange }) {
  const filterOptions = useMemo(() => [
    { key: 'all', label: 'All Quizzes', active: 'bg-secondary text-white', inactive: 'bg-gray-light text-primary hover:bg-gray-200' },
    { key: 'beginner', label: 'Beginner', active: 'bg-green-600 text-white', inactive: 'bg-green-100 text-green-800 hover:bg-green-200' },
    { key: 'intermediate', label: 'Intermediate', active: 'bg-yellow-600 text-white', inactive: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200' },
    { key: 'advanced', label: 'Advanced', active: 'bg-highlight text-white', inactive: 'bg-red-100 text-red-800 hover:bg-red-200' },
    { key: 'passed', label: 'Passed Only', active: 'bg-accent text-white', inactive: 'bg-accent/10 text-accent hover:bg-accent/20' },
  ], []);
  return (
    <section className="bg-white dark:bg-background-dark rounded-2xl shadow-md border border-gray-light mb-6 w-full max-w-3xl mx-auto animate-fade-in">
      <header className="p-4 border-b border-gray-light flex items-center gap-2">
        <FaFilter className="text-secondary text-lg" aria-hidden="true" />
        <h2 className="text-lg sm:text-xl font-semibold text-primary">Filters</h2>
      </header>
      <div className="p-4 flex flex-wrap gap-2 sm:gap-3 justify-center">
        {filterOptions.map(opt => (
          <button
            key={opt.key}
            type="button"
            onClick={() => onFilterChange(opt.key)}
            className={`px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-accent transition-all duration-200 shadow-sm ${filter === opt.key ? opt.active : opt.inactive}`}
            aria-pressed={filter === opt.key}
            aria-label={`Filter: ${opt.label}`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </section>
  );
});

export default FilterBar;

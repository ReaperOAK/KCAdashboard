
import React from 'react';

/**
 * FilterTabs: Beautiful, accessible, responsive filter tabs for quiz difficulty.
 */
const FilterTabs = React.memo(function FilterTabs({ filters, activeFilter, onChange }) {
  return (
    <nav
      className="flex flex-row gap-2 sm:gap-3 overflow-x-auto py-2 px-1 bg-background-light dark:bg-background-dark rounded-xl shadow-sm border border-gray-light w-full max-w-2xl mx-auto "
      role="tablist"
      aria-label="Quiz difficulty filters"
    >
      {filters.map(filter => (
        <button
          key={filter.id}
          onClick={() => onChange(filter.id)}
          className={`px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-medium transition-all duration-200 whitespace-nowrap focus:outline-none focus-visible:ring-2 focus-visible:ring-accent shadow-sm ${activeFilter === filter.id ? 'bg-secondary text-white' : 'bg-white text-secondary hover:bg-secondary hover:text-white'}`}
          role="tab"
          aria-selected={activeFilter === filter.id}
          tabIndex={activeFilter === filter.id ? 0 : -1}
          aria-label={`Filter: ${filter.label}`}
        >
          {filter.label}
        </button>
      ))}
    </nav>
  );
});

export default FilterTabs;

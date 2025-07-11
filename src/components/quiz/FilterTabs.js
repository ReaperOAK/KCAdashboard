import React from 'react';

/**
 * Filter tabs for quiz difficulty.
 * @param {Object} props
 */
const FilterTabs = React.memo(function FilterTabs({ filters, activeFilter, onChange }) {
  return (
    <div className="flex space-x-2 overflow-x-auto" role="tablist" aria-label="Quiz difficulty filters">
      {filters.map(filter => (
        <button
          key={filter.id}
          onClick={() => onChange(filter.id)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-accent ${activeFilter === filter.id ? 'bg-secondary text-white' : 'bg-white text-secondary hover:bg-secondary hover:text-white'}`}
          role="tab"
          aria-selected={activeFilter === filter.id}
          tabIndex={activeFilter === filter.id ? 0 : -1}
        >
          {filter.label}
        </button>
      ))}
    </div>
  );
});

export default FilterTabs;

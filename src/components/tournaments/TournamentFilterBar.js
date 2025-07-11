import React from 'react';

/**
 * Filter bar for tournament status (all, upcoming, ongoing, completed).
 * Accessible, keyboard navigable, and beautiful.
 */
const TournamentFilterBar = ({ filters, activeFilter, onFilterChange }) => (
  <div className="flex flex-wrap gap-2 sm:gap-4" role="tablist" aria-label="Tournament filters">
    {filters.map(filter => (
      <button
        key={filter.id}
        type="button"
        onClick={onFilterChange(filter.id)}
        className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-accent shadow-sm border border-transparent ${activeFilter === filter.id ? 'bg-secondary text-white shadow-md' : 'bg-white text-secondary hover:bg-secondary hover:text-white border-secondary'}`}
        role="tab"
        aria-selected={activeFilter === filter.id}
        tabIndex={activeFilter === filter.id ? 0 : -1}
      >
        {filter.label}
      </button>
    ))}
  </div>
);

export default React.memo(TournamentFilterBar);

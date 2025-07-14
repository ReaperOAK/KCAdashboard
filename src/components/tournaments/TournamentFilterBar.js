
import React from 'react';

/**
 * TournamentFilterBar: Beautiful, accessible, responsive filter bar for tournaments.
 * - Uses Tailwind color tokens from the design system.
 * - Responsive, visually clear, and focused (single responsibility).
 */
const TournamentFilterBar = React.memo(function TournamentFilterBar({ filters, activeFilter, onFilterChange, className = '' }) {
  return (
    <div
      className={["flex flex-wrap gap-2 sm:gap-4 w-full justify-center sm:justify-start", className].join(' ')}
      role="tablist"
      aria-label="Tournament filters"
    >
      {filters.map(filter => (
        <button
          key={filter.id}
          type="button"
          onClick={onFilterChange(filter.id)}
          className={[
            'px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-accent shadow-sm border',
            activeFilter === filter.id
              ? 'bg-secondary text-white shadow-md border-secondary'
              : 'bg-white text-secondary hover:bg-secondary hover:text-white border-secondary',
          ].join(' ')}
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

export default TournamentFilterBar;

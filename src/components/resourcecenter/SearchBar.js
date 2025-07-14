
import React, { useMemo } from 'react';

/**
 * SearchBar: Beautiful, responsive, single-responsibility search bar
 * - Input and button for searching resources
 * - Responsive, color tokens, accessible, mobile friendly
 */
const SearchBar = React.memo(function SearchBar({ value, onChange, onSubmit }) {
  // Memoize input value for performance
  const inputValue = useMemo(() => value, [value]);

  return (
    <form
      onSubmit={onSubmit}
      className="flex flex-col sm:flex-row gap-2 mb-6 w-full max-w-2xl mx-auto animate-fade-in"
      role="search"
      aria-label="Search resources"
    >
      <div className="relative flex-1">
        <input
          type="text"
          value={inputValue}
          onChange={e => onChange(e.target.value)}
          placeholder="Search resources..."
          className="w-full px-4 py-2 pl-10 rounded-lg border border-gray-light bg-background-light text-text-dark focus:outline-none focus:ring-2 focus:ring-accent transition-all duration-200 shadow-sm"
          aria-label="Search resources"
        />
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-dark/60 pointer-events-none" aria-hidden>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 1010.5 18.5a7.5 7.5 0 006.15-3.85z" />
          </svg>
        </span>
      </div>
      <button
        type="submit"
        className="px-5 py-2 bg-primary text-white rounded-lg hover:bg-secondary focus:ring-2 focus:ring-accent focus:outline-none transition-all duration-200 font-medium text-base flex items-center gap-2"
        aria-label="Search"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 1010.5 18.5a7.5 7.5 0 006.15-3.85z" />
        </svg>
        <span className="hidden sm:inline">Search</span>
      </button>
    </form>
  );
});

export default SearchBar;

import React from 'react';

const SearchBar = React.memo(function SearchBar({ value, onChange, onSubmit }) {
  return (
    <form onSubmit={onSubmit} className="flex gap-2 mb-6" role="search" aria-label="Search resources">
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder="Search resources..."
        className="flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-secondary"
        aria-label="Search resources"
      />
      <button
        type="submit"
        className="px-4 py-2 bg-secondary text-white rounded-lg hover:bg-accent transition-colors"
        aria-label="Search"
      >
        Search
      </button>
    </form>
  );
});

export default SearchBar;

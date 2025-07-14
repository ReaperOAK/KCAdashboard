
import React from 'react';
import { FaSearch } from 'react-icons/fa';

/**
 * SearchBar: Beautiful, accessible, and responsive search bar for quizzes.
 */
const SearchBar = React.memo(function SearchBar({ value, onChange }) {
  return (
    <form
      className="relative flex-grow max-w-md"
      role="search"
      autoComplete="off"
      onSubmit={e => e.preventDefault()}
    >
      <input
        type="text"
        placeholder="Search quizzes..."
        value={value}
        onChange={onChange}
        className="w-full px-4 py-2 pl-10 rounded-lg border border-gray-light bg-background-light text-text-dark placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-all text-base shadow-sm"
        aria-label="Search quizzes"
      />
      <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-accent pointer-events-none" aria-hidden="true" />
    </form>
  );
});

export default SearchBar;

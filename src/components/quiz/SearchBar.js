import React from 'react';
import { FaSearch } from 'react-icons/fa';

/**
 * Search bar for quizzes.
 * @param {Object} props
 */
const SearchBar = React.memo(function SearchBar({ value, onChange }) {
  return (
    <div className="relative flex-grow max-w-md">
      <input
        type="text"
        placeholder="Search quizzes..."
        value={value}
        onChange={onChange}
        className="w-full px-4 py-2 pl-10 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-secondary"
        aria-label="Search quizzes"
      />
      <FaSearch className="absolute left-3 top-3 text-gray-400" aria-hidden />
    </div>
  );
});

export default SearchBar;

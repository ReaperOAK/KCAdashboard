import React from 'react';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

const SearchBar = React.memo(({ value, onChange }) => (
  <div className="relative" role="search">
    <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-accent w-6 h-6 pointer-events-none" aria-hidden="true" />
    <input
      type="text"
      placeholder="Search games by title or description..."
      value={value}
      onChange={onChange}
      className="w-full pl-12 pr-4 py-3 border border-gray-light rounded-xl bg-background-light dark:bg-background-dark text-text-dark text-base focus:ring-2 focus:ring-accent focus:border-accent shadow-sm transition-all duration-200"
      aria-label="Search games"
    />
  </div>
));

export default SearchBar;

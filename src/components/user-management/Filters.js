
import React, { useCallback, memo } from 'react';


const SearchInput = memo(function SearchInput({ value, onChange }) {
  const handleChange = useCallback((e) => onChange(e.target.value), [onChange]);
  return (
    <input
      type="text"
      placeholder="Search users..."
      value={value}
      onChange={handleChange}
      className="w-full px-4 py-2 rounded-lg border border-gray-light focus:outline-none focus:ring-2 focus:ring-accent text-text-dark bg-background-light placeholder-gray-dark transition-all duration-200"
      aria-label="Search users"
      autoComplete="off"
    />
  );
});

const FilterSelect = memo(function FilterSelect({ value, onChange }) {
  const handleChange = useCallback((e) => onChange(e.target.value), [onChange]);
  return (
    <select
      value={value}
      onChange={handleChange}
      className="w-full sm:w-auto px-4 py-2 rounded-lg border border-gray-light focus:outline-none focus:ring-2 focus:ring-accent text-text-dark bg-background-light transition-all duration-200"
      aria-label="Filter users by role"
    >
      <option value="all">All Users</option>
      <option value="student">Students</option>
      <option value="teacher">Teachers</option>
      <option value="admin">Admins</option>
    </select>
  );
});

const Filters = memo(function Filters({ searchTerm, setSearchTerm, filter, setFilter }) {
  return (
    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-4 w-full" role="search" aria-label="User filters">
      <div className="flex-1 min-w-[180px]">
        <SearchInput value={searchTerm} onChange={setSearchTerm} />
      </div>
      <div className="w-full sm:w-56">
        <FilterSelect value={filter} onChange={setFilter} />
      </div>
    </div>
  );
});

export { Filters };
export default Filters;

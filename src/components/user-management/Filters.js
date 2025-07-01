
import React, { useCallback, memo } from 'react';

const SearchInput = memo(function SearchInput({ value, onChange }) {
  const handleChange = useCallback((e) => onChange(e.target.value), [onChange]);
  return (
    <input
      type="text"
      placeholder="Search users..."
      value={value}
      onChange={handleChange}
      className="w-full px-4 py-2 rounded-lg border border-gray-light focus:outline-none focus:ring-2 focus:ring-accent text-text-dark bg-white"
      aria-label="Search users"
    />
  );
});

const FilterSelect = memo(function FilterSelect({ value, onChange }) {
  const handleChange = useCallback((e) => onChange(e.target.value), [onChange]);
  return (
    <select
      value={value}
      onChange={handleChange}
      className="w-full sm:w-auto px-4 py-2 rounded-lg border border-gray-light focus:outline-none focus:ring-2 focus:ring-accent text-text-dark bg-white"
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
    <div className="flex flex-col sm:flex-row gap-4 mb-4" role="search" aria-label="User filters">
      <div className="flex-1">
        <SearchInput value={searchTerm} onChange={setSearchTerm} />
      </div>
      <FilterSelect value={filter} onChange={setFilter} />
    </div>
  );
});

export { Filters };
export default Filters;

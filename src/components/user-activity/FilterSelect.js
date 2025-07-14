
import React from 'react';

/**
 * FilterSelect - Beautiful, accessible, responsive dropdown for filtering activity type.
 * @param {Object} props
 * @param {string} props.value
 * @param {function} props.onChange
 */
const FilterSelect = React.memo(function FilterSelect({ value, onChange }) {
  return (
    <div className="relative w-full max-w-xs">
      <select
        value={value}
        onChange={onChange}
        className="block w-full pl-10 pr-8 py-2 rounded-md border border-gray-dark bg-background-light text-text-dark focus:border-accent focus:ring-2 focus:ring-accent focus:outline-none transition-all duration-200 shadow-sm appearance-none text-base sm:text-sm"
        aria-label="Filter activity type"
      >
        <option value="all">All Activities</option>
        <option value="login">Logins</option>
        <option value="update">Updates</option>
        <option value="permission">Permissions</option>
      </select>
      {/* Icon: Lucide/heroicon style chevron */}
      <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-accent">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true"><path d="M8 10l4 4 4-4" /></svg>
      </div>
      <div className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-gray-dark">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9l6 6 6-6" /></svg>
      </div>
    </div>
  );
});

export default FilterSelect;

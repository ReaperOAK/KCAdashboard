import React from 'react';

/**
 * FilterSelect - Dropdown for filtering activity type.
 * @param {Object} props
 * @param {string} props.value
 * @param {function} props.onChange
 */
const FilterSelect = React.memo(function FilterSelect({ value, onChange }) {
  return (
    <select
      value={value}
      onChange={onChange}
      className="rounded-md border border-gray-dark bg-background-light text-text-dark focus:border-accent focus:ring-accent transition-all duration-200"
      aria-label="Filter activity type"
    >
      <option value="all">All Activities</option>
      <option value="login">Logins</option>
      <option value="update">Updates</option>
      <option value="permission">Permissions</option>
    </select>
  );
});

export default FilterSelect;

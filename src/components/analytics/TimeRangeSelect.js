import React, { useCallback } from 'react';

const TimeRangeSelect = React.memo(function TimeRangeSelect({ value, onChange }) {
  const handleChange = useCallback((e) => onChange(e.target.value), [onChange]);
  return (
    <select
      value={value}
      onChange={handleChange}
      className="px-4 py-2 rounded-lg border border-accent bg-background-light text-primary font-medium focus:outline-none focus:ring-2 focus:ring-accent transition-all duration-200 shadow-sm hover:border-secondary"
      aria-label="Select time range"
    >
      <option value="week">Last Week</option>
      <option value="month">Last Month</option>
      <option value="year">Last Year</option>
    </select>
  );
});

export default TimeRangeSelect;

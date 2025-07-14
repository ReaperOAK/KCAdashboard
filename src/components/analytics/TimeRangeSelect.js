import React, { useCallback } from 'react';
import { ChevronDown } from 'lucide-react';

// Enhanced TimeRangeSelect: beautiful, responsive, accessible, and focused
const TimeRangeSelect = React.memo(function TimeRangeSelect({ value, onChange }) {
  const handleChange = useCallback((e) => onChange(e.target.value), [onChange]);
  return (
    <div className="relative w-full max-w-xs">
      <label htmlFor="time-range-select" className="sr-only">Select time range</label>
      <select
        id="time-range-select"
        value={value}
        onChange={handleChange}
        className="appearance-none w-full px-4 py-2 pr-10 rounded-lg border border-accent bg-background-light text-primary font-medium focus:outline-none focus:ring-2 focus:ring-accent transition-all duration-200 shadow-sm hover:border-secondary cursor-pointer text-sm sm:text-base"
        aria-label="Select time range"
      >
        <option value="week">Last Week</option>
        <option value="month">Last Month</option>
        <option value="year">Last Year</option>
      </select>
      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-accent">
        <ChevronDown className="w-5 h-5" aria-hidden="true" />
      </span>
    </div>
  );
});

export default TimeRangeSelect;

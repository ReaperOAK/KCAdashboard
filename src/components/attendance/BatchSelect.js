
import React from 'react';

const ChevronDownIcon = (
  <svg className="w-4 h-4 text-gray-500 pointer-events-none absolute right-3 top-1/2 transform -translate-y-1/2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
);

const BatchSelect = React.memo(function BatchSelect({ batches, selectedBatch, onChange }) {
  return (
    <div className="relative w-full max-w-xs">
      <select
        value={selectedBatch}
        onChange={onChange}
        className="appearance-none w-full px-4 py-2 pr-8 rounded-lg bg-background-light border border-gray-light text-text-dark shadow-sm focus:outline-none focus:ring-2 focus:ring-secondary focus:border-secondary transition-all duration-200 text-sm sm:text-base"
        aria-label="Select batch"
      >
        <option value="all">All Batches</option>
        {batches.map(batch => (
          <option key={batch.id} value={batch.id}>{batch.name}</option>
        ))}
      </select>
      {ChevronDownIcon}
    </div>
  );
});

export default BatchSelect;

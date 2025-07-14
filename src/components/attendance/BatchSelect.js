
import React from 'react';


const ChevronDownIcon = (
  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 flex items-center z-10">
    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
  </span>
);


const BatchSelect = React.memo(function BatchSelect({ batches, selectedBatch, onChange }) {
  return (
    <div className="relative w-full max-w-xs flex flex-col">
      <label htmlFor="batch-select" className="mb-1 text-xs font-medium text-primary sr-only sm:not-sr-only">Batch</label>
      <div className="relative">
        <select
          id="batch-select"
          value={selectedBatch}
          onChange={onChange}
          className="appearance-none w-full px-4 py-2 pr-10 rounded-lg bg-background-light border border-gray-light text-text-dark shadow-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent hover:border-accent transition-all duration-200 text-sm sm:text-base z-0"
          aria-label="Select batch"
          style={{ WebkitAppearance: 'none', MozAppearance: 'none', appearance: 'none' }}
        >
          <option value="all">All Batches</option>
          {batches.map(batch => (
            <option key={batch.id} value={batch.id}>{batch.name}</option>
          ))}
        </select>
        {ChevronDownIcon}
      </div>
    </div>
  );
});

export default BatchSelect;

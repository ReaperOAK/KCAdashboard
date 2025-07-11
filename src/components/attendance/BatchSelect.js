import React from 'react';

const BatchSelect = React.memo(function BatchSelect({ batches, selectedBatch, onChange }) {
  return (
    <select
      value={selectedBatch}
      onChange={onChange}
      className="px-4 py-2 rounded-lg border border-gray-light focus:outline-none focus:ring-2 focus:ring-secondary"
      aria-label="Select batch"
    >
      <option value="all">All Batches</option>
      {batches.map(batch => (
        <option key={batch.id} value={batch.id}>{batch.name}</option>
      ))}
    </select>
  );
});

export default BatchSelect;

import React from 'react';
import PropTypes from 'prop-types';

const SearchAndBatchFilter = React.memo(function SearchAndBatchFilter({ searchTerm, onSearch, selectedBatch, onBatchChange, batches }) {
  return (
    <div className="flex flex-col md:flex-row md:space-x-4 gap-2 md:gap-0">
      <input
        type="text"
        placeholder="Search students..."
        value={searchTerm}
        onChange={onSearch}
        className="px-4 py-2 border border-gray-light rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
        aria-label="Search students"
      />
      <select
        value={selectedBatch}
        onChange={onBatchChange}
        className="px-4 py-2 border border-gray-light rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
        aria-label="Select batch"
      >
        <option value="all">All Batches</option>
        {batches.map(batch => (
          <option key={batch.id} value={batch.id}>{batch.name}</option>
        ))}
      </select>
    </div>
  );
});

SearchAndBatchFilter.propTypes = {
  searchTerm: PropTypes.string.isRequired,
  onSearch: PropTypes.func.isRequired,
  selectedBatch: PropTypes.string.isRequired,
  onBatchChange: PropTypes.func.isRequired,
  batches: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    name: PropTypes.string.isRequired,
  })).isRequired,
};

export default SearchAndBatchFilter;

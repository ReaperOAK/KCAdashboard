
import React from 'react';
import PropTypes from 'prop-types';

const SearchIcon = (
  <svg className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="8" /><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-2-2" /></svg>
);
const ChevronDownIcon = (
  <svg className="w-4 h-4 text-gray-500 absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
);

const SearchAndBatchFilter = React.memo(function SearchAndBatchFilter({ searchTerm, onSearch, selectedBatch, onBatchChange, batches }) {
  return (
    <div className="w-full max-w-2xl mx-auto bg-background-light border border-gray-light rounded-xl shadow-md p-4 flex flex-col sm:flex-row sm:items-center gap-3 mb-4 animate-fade-in">
      {/* Search input with icon */}
      <div className="relative flex-1 min-w-0">
        <input
          type="text"
          placeholder="Search students..."
          value={searchTerm}
          onChange={onSearch}
          className="w-full pl-9 pr-3 py-2 border border-gray-light rounded-lg bg-white text-text-dark focus:outline-none focus:ring-2 focus:ring-secondary focus:border-secondary transition-all duration-200 text-sm"
          aria-label="Search students"
        />
        {SearchIcon}
      </div>
      {/* Batch select with chevron icon */}
      <div className="relative flex-1 min-w-0">
        <select
          value={selectedBatch}
          onChange={onBatchChange}
          className="appearance-none w-full pl-4 pr-8 py-2 border border-gray-light rounded-lg bg-white text-text-dark focus:outline-none focus:ring-2 focus:ring-secondary focus:border-secondary transition-all duration-200 text-sm"
          aria-label="Select batch"
        >
          <option value="all">All Batches</option>
          {batches.map(batch => (
            <option key={batch.id} value={batch.id}>{batch.name}</option>
          ))}
        </select>
        {ChevronDownIcon}
      </div>
      <style>{`
        @keyframes fade-in { from { opacity: 0; transform: translateY(-8px);} to { opacity: 1; transform: none; } }
        .animate-fade-in { animation: fade-in 0.3s ease; }
      `}</style>
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

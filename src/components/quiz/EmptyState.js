import React from 'react';

/**
 * Empty state for quiz list.
 * @param {Object} props
 * @param {string} props.searchQuery
 * @param {function} props.onClear
 */
const EmptyState = React.memo(function EmptyState({ searchQuery, onClear }) {
  return (
    <div className="text-center py-8 bg-white rounded-lg shadow-md">
      <p className="text-gray-600 mb-4">No quizzes found matching your criteria.</p>
      {searchQuery && (
        <button
          onClick={onClear}
          className="px-4 py-2 bg-secondary text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-accent transition-all duration-200"
        >
          Clear Search
        </button>
      )}
    </div>
  );
});

export default EmptyState;

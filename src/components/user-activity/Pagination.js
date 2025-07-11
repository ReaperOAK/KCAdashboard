import React, { useCallback } from 'react';

/**
 * Pagination - Pagination controls for activity list.
 * @param {Object} props
 * @param {number} props.page
 * @param {function} props.setPage
 * @param {boolean} props.hasNext
 */
const Pagination = React.memo(function Pagination({ page, setPage, hasNext }) {
  const handlePrev = useCallback(() => setPage((p) => Math.max(1, p - 1)), [setPage]);
  const handleNext = useCallback(() => setPage((p) => p + 1), [setPage]);
  return (
    <div className="px-2 py-2 sm:px-4 sm:py-3 flex justify-between items-center border-t border-gray-dark bg-background-light transition-all duration-200">
      <button
        onClick={handlePrev}
        disabled={page === 1}
        className="px-4 py-2 border border-gray-dark rounded-md disabled:opacity-50 bg-primary text-white hover:bg-secondary focus:outline-none focus-visible:ring-2 focus-visible:ring-accent transition-all duration-200"
        aria-label="Previous page"
      >
        Previous
      </button>
      <span className="text-sm text-gray-dark">Page {page}</span>
      <button
        onClick={handleNext}
        disabled={!hasNext}
        className="px-4 py-2 border border-gray-dark rounded-md disabled:opacity-50 bg-primary text-white hover:bg-secondary focus:outline-none focus-visible:ring-2 focus-visible:ring-accent transition-all duration-200"
        aria-label="Next page"
      >
        Next
      </button>
    </div>
  );
});

export default Pagination;

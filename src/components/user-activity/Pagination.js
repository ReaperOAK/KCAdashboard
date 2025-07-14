
import React, { useCallback } from 'react';

/**
 * Pagination - Beautiful, accessible, responsive pagination controls for activity list.
 * @param {Object} props
 * @param {number} props.page
 * @param {function} props.setPage
 * @param {boolean} props.hasNext
 */
const Pagination = React.memo(function Pagination({ page, setPage, hasNext }) {
  const handlePrev = useCallback(() => setPage((p) => Math.max(1, p - 1)), [setPage]);
  const handleNext = useCallback(() => setPage((p) => p + 1), [setPage]);
  return (
    <nav
      className="w-full max-w-2xl mx-auto px-2 py-3 sm:px-6 flex flex-row justify-between items-center gap-2 border-t border-gray-dark bg-background-light rounded-b-lg shadow-sm transition-all duration-200 "
      aria-label="Pagination navigation"
      role="navigation"
    >
      <button
        onClick={handlePrev}
        disabled={page === 1}
        className="flex items-center gap-2 px-3 py-2 border border-gray-dark rounded-md disabled:opacity-50 bg-primary text-white hover:bg-secondary focus:outline-none focus-visible:ring-2 focus-visible:ring-accent transition-all duration-200"
        aria-label="Previous page"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true"><path d="M15 19l-7-7 7-7" /></svg>
        <span className="hidden sm:inline">Previous</span>
      </button>
      <span className="text-sm text-gray-dark font-medium px-2 py-1 rounded bg-gray-light/30">Page {page}</span>
      <button
        onClick={handleNext}
        disabled={!hasNext}
        className="flex items-center gap-2 px-3 py-2 border border-gray-dark rounded-md disabled:opacity-50 bg-primary text-white hover:bg-secondary focus:outline-none focus-visible:ring-2 focus-visible:ring-accent transition-all duration-200"
        aria-label="Next page"
      >
        <span className="hidden sm:inline">Next</span>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5l7 7-7 7" /></svg>
      </button>
    </nav>
  );
});

export default Pagination;

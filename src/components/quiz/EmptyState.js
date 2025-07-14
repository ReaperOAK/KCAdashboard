
import React from 'react';

/**
 * EmptyState: Beautiful, accessible, responsive empty state for quiz list.
 */
const EmptyState = React.memo(function EmptyState({ searchQuery, onClear }) {
  return (
    <div className="flex flex-col items-center justify-center py-10 px-4 bg-background-light dark:bg-background-dark rounded-2xl shadow-md border border-gray-light w-full max-w-xl mx-auto ">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-16 w-16 text-accent mb-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        aria-hidden="true"
        focusable="false"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2a4 4 0 018 0v2m-4-6a4 4 0 100-8 4 4 0 000 8zm-6 8v-2a4 4 0 014-4h.5" />
      </svg>
      <p className="text-lg sm:text-xl text-text-dark dark:text-text-light font-medium mb-2">No quizzes found</p>
      <p className="text-sm text-gray-dark mb-6">{searchQuery ? 'No quizzes match your search.' : 'There are no quizzes to display yet.'}</p>
      {searchQuery && (
        <button
          onClick={onClear}
          className="px-5 py-2 rounded-lg bg-primary text-white hover:bg-secondary focus:outline-none focus-visible:ring-2 focus-visible:ring-accent transition-all duration-200 font-semibold shadow-sm"
          aria-label="Clear search and show all quizzes"
        >
          Clear Search
        </button>
      )}
    </div>
  );
});

export default EmptyState;

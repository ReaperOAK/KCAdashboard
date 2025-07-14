
import React, { useMemo } from 'react';

/**
 * EmptyState: Beautiful, responsive, single-responsibility empty state
 * - Shows a message and icon for empty resource lists
 * - Responsive, color tokens, accessible, mobile friendly
 */
const EmptyState = React.memo(function EmptyState({ showBookmarksOnly, searchTerm }) {
  // Memoize message for performance
  const message = useMemo(() => {
    if (showBookmarksOnly) return "You haven't bookmarked any resources yet.";
    if (searchTerm) return `No resources found matching "${searchTerm}"`;
    return "No resources found in this category.";
  }, [showBookmarksOnly, searchTerm]);

  return (
    <section className="flex flex-col items-center justify-center py-10 px-4 bg-background-light dark:bg-background-dark rounded-2xl shadow-md border border-gray-light w-full max-w-xl mx-auto animate-fade-in">
      <span className="mb-4 text-5xl md:text-6xl text-gray-dark/40 select-none" aria-hidden>📭</span>
      <p className="text-lg md:text-xl text-gray-dark text-center font-medium mb-1">{message}</p>
      <p className="text-sm text-gray-dark/70 text-center">Try adjusting your filters or search terms.</p>
    </section>
  );
});

export default EmptyState;

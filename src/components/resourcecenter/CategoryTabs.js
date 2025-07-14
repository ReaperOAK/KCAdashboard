
import React, { useMemo } from 'react';

// Pure tab button for single responsibility and performance
const TabButton = React.memo(function TabButton({ label, isActive, onClick, id }) {
  return (
    <button
      key={id}
      type="button"
      role="tab"
      aria-selected={isActive}
      aria-controls={`tabpanel-${id}`}
      tabIndex={isActive ? 0 : -1}
      onClick={onClick}
      className={[
        'px-4 py-2 rounded-lg text-sm font-medium',
        'transition-all duration-200',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-accent',
        'min-w-[96px] sm:min-w-[120px]',
        isActive
          ? 'bg-secondary text-white shadow-md border-b-2 border-accent'
          : 'bg-white text-secondary hover:bg-secondary hover:text-white border border-gray-light',
        'whitespace-nowrap',
        'aria-selected:bg-secondary aria-selected:text-white',
      ].join(' ')}
      style={{ WebkitTapHighlightColor: 'transparent' }}
    >
      {label}
    </button>
  );
});

/**
 * CategoryTabs: Responsive, accessible, beautiful tablist for resource categories
 * - Single responsibility: only renders tabs, no content
 * - Optimized: memoized tab rendering, pure TabButton
 * - Responsive: horizontal scroll, touch-friendly, min-widths
 * - Accessible: ARIA roles, keyboard nav ready
 * - Beautiful: Tailwind tokens, shadow, border, transitions
 */
const CategoryTabs = React.memo(function CategoryTabs({ categories, activeCategory, onCategoryChange }) {
  // Memoize tab rendering for performance
  const tabButtons = useMemo(() =>
    categories.map(category => (
      <TabButton
        key={category.id}
        id={category.id}
        label={category.label}
        isActive={activeCategory === category.id}
        onClick={() => onCategoryChange(category.id)}
      />
    )), [categories, activeCategory, onCategoryChange]);

  // Keyboard navigation (optional: implement if needed)
  // ...

  return (
    <nav
      className="mb-6 w-full overflow-x-auto scrollbar-thin scrollbar-thumb-gray-light scrollbar-track-background-light"
      aria-label="Resource categories"
    >
      <div
        className="flex gap-2 sm:gap-4 md:gap-6 pb-2"
        role="tablist"
      >
        {tabButtons}
      </div>
    </nav>
  );
});

export default CategoryTabs;

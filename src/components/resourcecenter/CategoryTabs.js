import React from 'react';

const CategoryTabs = React.memo(function CategoryTabs({ categories, activeCategory, onCategoryChange }) {
  return (
    <div className="mb-6 flex space-x-4 overflow-x-auto pb-2" role="tablist" aria-label="Resource categories">
      {categories.map(category => (
        <button
          key={category.id}
          type="button"
          role="tab"
          aria-selected={activeCategory === category.id}
          tabIndex={activeCategory === category.id ? 0 : -1}
          onClick={() => onCategoryChange(category.id)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent ${activeCategory === category.id ? 'bg-secondary text-white' : 'bg-white text-secondary hover:bg-secondary hover:text-white'}`}
        >
          {category.label}
        </button>
      ))}
    </div>
  );
});

export default CategoryTabs;

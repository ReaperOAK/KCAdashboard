import React from 'react';


const FilterPanel = React.memo(({
  categories,
  selectedCategory,
  onCategoryChange,
  glass,
  resourceCategories = [],
  activeResourceCategory = 'public',
  onResourceCategoryChange,
}) => (
  <section className={`p-6 rounded-xl ${glass} border border-gray-light shadow-md space-y-6`} aria-label="Filters">
    {/* Responsive row for dropdowns */}
    <div className="flex flex-col md:flex-row md:items-end md:space-x-6 space-y-4 md:space-y-0 w-full">
      {resourceCategories.length > 0 && (
        <div className="flex-1">
          <label className="block text-base font-semibold text-accent mb-2">Resource Type</label>
          <select
            value={activeResourceCategory}
            onChange={e => onResourceCategoryChange(e.target.value)}
            className="w-full p-3 border border-gray-light rounded-lg bg-background-light dark:bg-background-dark text-text-dark text-base focus:ring-2 focus:ring-accent focus:border-accent"
            aria-label="Resource category filter"
          >
            {resourceCategories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.label}</option>
            ))}
          </select>
        </div>
      )}
      <div className="flex-1">
        <label className="block text-base font-semibold text-accent mb-2">Game Category</label>
        <select
          value={selectedCategory}
          onChange={onCategoryChange}
          className="w-full p-3 border border-gray-light rounded-lg bg-background-light dark:bg-background-dark text-text-dark text-base focus:ring-2 focus:ring-accent focus:border-accent"
          aria-label="Game category filter"
        >
          {categories.map((cat) => (
            <option key={cat.value} value={cat.value}>{cat.label}</option>
          ))}
        </select>
      </div>
    </div>
  </section>
));

export default FilterPanel;

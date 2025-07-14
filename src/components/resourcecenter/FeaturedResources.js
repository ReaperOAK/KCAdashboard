
import React, { useMemo } from 'react';
import ResourceCard from './ResourceCard';

/**
 * FeaturedResources: Beautiful, responsive, single-responsibility featured section
 * - Shows a grid of featured resources
 * - Responsive, color tokens, accessible, mobile friendly
 */
const FeaturedResources = React.memo(function FeaturedResources({ featured, onBookmarkToggle, onResourceClick }) {
  // Memoize resource cards for performance
  const resourceCards = useMemo(() =>
    Array.isArray(featured) && featured.length > 0
      ? featured.map(resource => (
          <ResourceCard
            key={resource.id}
            resource={resource}
            onBookmarkToggle={onBookmarkToggle}
            onResourceClick={onResourceClick}
          />
        ))
      : null,
    [featured, onBookmarkToggle, onResourceClick]
  );

  if (!resourceCards) return null;

  return (
    <section className="mb-10 w-full animate-fade-in" aria-label="Featured Resources">
      <h2 className="text-2xl md:text-3xl font-semibold text-primary mb-4 px-2 md:px-0">Featured Resources</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {resourceCards}
      </div>
    </section>
  );
});

export default FeaturedResources;

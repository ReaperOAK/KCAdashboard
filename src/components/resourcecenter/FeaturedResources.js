import React from 'react';
import ResourceCard from './ResourceCard';

const FeaturedResources = React.memo(function FeaturedResources({ featured, onBookmarkToggle, onResourceClick }) {
  if (!Array.isArray(featured) || featured.length === 0) return null;
  return (
    <div className="mb-8">
      <h2 className="text-2xl font-semibold text-primary mb-4">Featured Resources</h2>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {featured.map(resource => (
          <ResourceCard
            key={resource.id}
            resource={resource}
            onBookmarkToggle={onBookmarkToggle}
            onResourceClick={onResourceClick}
          />
        ))}
      </div>
    </div>
  );
});

export default FeaturedResources;

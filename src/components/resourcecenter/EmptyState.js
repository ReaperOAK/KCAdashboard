import React from 'react';

const EmptyState = React.memo(function EmptyState({ showBookmarksOnly, searchTerm }) {
  return (
    <div className="text-center py-8 bg-white rounded-xl shadow-lg">
      <p className="text-lg text-gray-600">
        {showBookmarksOnly
          ? "You haven't bookmarked any resources yet."
          : searchTerm
            ? `No resources found matching "${searchTerm}"`
            : "No resources found in this category."}
      </p>
    </div>
  );
});

export default EmptyState;

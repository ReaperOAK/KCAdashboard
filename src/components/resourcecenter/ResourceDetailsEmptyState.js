import React from 'react';

const ResourceDetailsEmptyState = React.memo(function ResourceDetailsEmptyState({ onBack }) {
  return (
    <div className="text-center py-8 bg-white rounded-xl shadow-lg">
      <p className="text-lg text-gray-600">Resource not found</p>
      <button
        onClick={onBack}
        className="mt-4 px-4 py-2 bg-secondary text-white rounded-lg hover:bg-accent transition-colors"
        aria-label="Back to Resources"
      >
        Back to Resources
      </button>
    </div>
  );
});

export default ResourceDetailsEmptyState;

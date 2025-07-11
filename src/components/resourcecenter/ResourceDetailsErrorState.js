import React from 'react';

const ResourceDetailsErrorState = React.memo(function ResourceDetailsErrorState({ message, onBack }) {
  return (
    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6" role="alert">
      {message}
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

export default ResourceDetailsErrorState;

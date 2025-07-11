import React from 'react';

const EmptyState = React.memo(function EmptyState({ message }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-gray-dark">
      <svg className="w-12 h-12 mb-2 text-gray-light" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2a4 4 0 0 1 8 0v2m-4 4a4 4 0 0 1-4-4H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2a4 4 0 0 1-4 4Z" /></svg>
      <span className="text-lg font-medium">{message}</span>
    </div>
  );
});

export default EmptyState;

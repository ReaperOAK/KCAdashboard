import React from 'react';

const LoadingSkeleton = () => (
  <div className="flex justify-center items-center h-64">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-secondary" aria-label="Loading" />
  </div>
);

export default React.memo(LoadingSkeleton);

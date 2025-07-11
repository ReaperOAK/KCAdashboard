import React from 'react';

const SupportSkeleton = React.memo(() => (
  <div className="py-8 animate-pulse" aria-busy="true" aria-label="Loading support system">
    <div className="bg-background-light rounded-xl border border-gray-light shadow-md h-32 mb-4" />
    <div className="bg-background-light rounded-xl border border-gray-light shadow-md h-32" />
  </div>
));

export default SupportSkeleton;

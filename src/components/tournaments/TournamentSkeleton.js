import React from 'react';

const TournamentSkeleton = React.memo(() => (
  <div className="text-center py-10 animate-pulse" aria-busy="true" aria-label="Loading tournaments">
    <div className="h-8 w-1/3 mx-auto bg-gray-light rounded mb-4" />
    <div className="h-32 bg-background-light rounded-xl border border-gray-light shadow-md mx-auto w-full max-w-4xl" />
  </div>
));

export default TournamentSkeleton;

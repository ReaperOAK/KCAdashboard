import React from 'react';

const ClassroomDetailLoading = React.memo(() => (
  <div className="min-h-screen bg-background-light p-8 flex items-center justify-center" aria-busy="true" aria-label="Loading classroom details">
    <div className="w-full max-w-2xl animate-pulse">
      <div className="h-8 bg-gray-light rounded w-1/2 mb-6" />
      <div className="h-6 bg-gray-light rounded w-1/3 mb-4" />
      <div className="h-4 bg-gray-light rounded w-1/4 mb-2" />
      <div className="h-4 bg-gray-light rounded w-1/4 mb-2" />
      <div className="h-4 bg-gray-light rounded w-1/4 mb-2" />
    </div>
  </div>
));

export default ClassroomDetailLoading;

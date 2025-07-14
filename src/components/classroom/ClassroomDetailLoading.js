import React from 'react';

const ClassroomDetailLoading = React.memo(() => (
  <section className="min-h-screen bg-background-light dark:bg-background-dark flex items-center justify-center p-4 " aria-busy="true" aria-label="Loading classroom details">
    <div className="w-full max-w-2xl animate-pulse space-y-6">
      <div className="h-8 bg-gray-light dark:bg-gray-dark rounded w-1/2 mb-2" />
      <div className="h-6 bg-gray-light dark:bg-gray-dark rounded w-1/3 mb-2" />
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="h-4 bg-gray-light dark:bg-gray-dark rounded w-1/4 mb-2" />
        <div className="h-4 bg-gray-light dark:bg-gray-dark rounded w-1/4 mb-2" />
        <div className="h-4 bg-gray-light dark:bg-gray-dark rounded w-1/4 mb-2" />
      </div>
      <div className="h-4 bg-gray-light dark:bg-gray-dark rounded w-1/3 mb-2" />
      <div className="h-4 bg-gray-light dark:bg-gray-dark rounded w-1/2 mb-2" />
    </div>
  </section>
));

export default ClassroomDetailLoading;

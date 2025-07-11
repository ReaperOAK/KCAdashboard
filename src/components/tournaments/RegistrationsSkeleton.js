import React from 'react';

const RegistrationsSkeleton = React.memo(() => (
  <div className="text-center py-10" role="status" aria-live="polite">
    <div className="animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent mx-auto mb-3" />
    <p className="mt-3 text-gray-dark">Loading registrations...</p>
  </div>
));

export default RegistrationsSkeleton;

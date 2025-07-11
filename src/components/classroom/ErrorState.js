import React from 'react';

const ErrorState = React.memo(({ error }) => (
  <div className="flex items-center justify-center min-h-screen bg-background-light" role="alert" aria-live="assertive">
    <div className="text-center">
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
        {error}
      </div>
    </div>
  </div>
));

export default ErrorState;

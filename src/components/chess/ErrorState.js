import React from 'react';

const ErrorState = React.memo(({ message, onReload }) => (
  <section className="flex flex-col items-center justify-center min-h-96 space-y-4" role="alert">
    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded shadow-md text-center ">
      {message}
    </div>
    {onReload && (
      <button
        type="button"
        onClick={onReload}
        className="px-4 py-2 bg-primary text-white rounded hover:bg-secondary transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus:ring-offset-2"
      >
        Reload Page
      </button>
    )}
  </section>
));

export default ErrorState;

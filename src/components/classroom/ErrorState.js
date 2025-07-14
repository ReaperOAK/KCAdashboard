import React from 'react';

const ErrorState = React.memo(({ error }) => (
  <section className="flex items-center justify-center min-h-screen bg-background-light dark:bg-background-dark p-4 " role="alert" aria-live="assertive">
    <div className="text-center w-full max-w-lg">
      <div className="bg-red-700 border border-red-800 text-white px-6 py-4 rounded-2xl mb-4 shadow-lg flex flex-col items-center ">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mb-2 text-white animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        <span className="font-semibold text-lg sm:text-xl break-words">{error}</span>
      </div>
    </div>
  </section>
));

export default ErrorState;

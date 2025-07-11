import React from 'react';

const ErrorAlert = React.memo(function ErrorAlert({ message }) {
  return (
    <div className="bg-error border-l-4 border-red-800 text-white px-4 py-3 rounded mb-4 flex items-center" role="alert">
      <svg className="w-5 h-5 mr-2 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12A9 9 0 1 1 3 12a9 9 0 0 1 18 0Z" /></svg>
      <span>{message}</span>
    </div>
  );
});

export default ErrorAlert;

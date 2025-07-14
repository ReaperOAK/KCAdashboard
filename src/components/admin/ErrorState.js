import React from 'react';
import PropTypes from 'prop-types';
import { ExclamationCircleIcon } from '@heroicons/react/24/solid';

// Beautiful, accessible error state for admin dashboard
const ErrorState = React.memo(function ErrorState({ error, className = '' }) {
  if (!error) return null;
  return (
    <div className={`p-8 bg-background-light dark:bg-background-dark min-h-screen flex items-center justify-center ${className}`} role="alert" aria-live="assertive" tabIndex={0}>
      <div className="bg-error border border-error text-white px-6 py-4 rounded-2xl flex items-center gap-3 shadow-lg max-w-xl w-full animate-fade-in">
        <ExclamationCircleIcon className="h-7 w-7 text-white drop-shadow" aria-hidden="true" />
        <div className="flex flex-col items-start">
          <span className="font-bold text-lg">Error!</span>
          <span className="block text-base sm:text-lg mt-1">{error}</span>
        </div>
      </div>
    </div>
  );
});

ErrorState.propTypes = {
  error: PropTypes.string,
  className: PropTypes.string,
};

export default ErrorState;

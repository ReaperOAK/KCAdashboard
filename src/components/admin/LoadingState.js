import React from 'react';
import PropTypes from 'prop-types';
import { ArrowPathIcon } from '@heroicons/react/24/solid';

// Beautiful, accessible loading state for admin dashboard
const LoadingState = React.memo(function LoadingState({ message = 'Loading dashboard data...', className = '' }) {
  return (
    <div className={`p-8 bg-background-light dark:bg-background-dark min-h-screen flex items-center justify-center ${className}`} role="status" aria-live="polite" tabIndex={0}>
      <span className="relative flex h-16 w-16 mr-6">
        <ArrowPathIcon className="animate-spin h-16 w-16 text-primary dark:text-accent drop-shadow" aria-label="Loading" />
        <span className="sr-only">Loading...</span>
      </span>
      <div className="text-xl sm:text-2xl text-primary dark:text-accent font-semibold tracking-wide animate-pulse">{message}</div>
    </div>
  );
});

LoadingState.propTypes = {
  message: PropTypes.string,
  className: PropTypes.string,
};

export default LoadingState;

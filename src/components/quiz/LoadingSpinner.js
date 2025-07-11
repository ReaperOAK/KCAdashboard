import React from 'react';
import { FaChessPawn } from 'react-icons/fa';

/**
 * Loading spinner for quiz pages.
 */
const LoadingSpinner = React.memo(() => (
  <div className="min-h-screen bg-background-light p-8 flex items-center justify-center">
    <div className="text-center">
      <FaChessPawn className="animate-bounce mx-auto text-4xl text-secondary mb-4" aria-hidden="true" />
      <p className="text-xl text-gray-dark">Loading quiz...</p>
    </div>
  </div>
));

export default LoadingSpinner;

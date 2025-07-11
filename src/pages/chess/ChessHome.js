
import React, { useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * ChessHome
 * Redirects to /chess/play on mount. Shows fallback UI for accessibility and slow navigation.
 */
const ChessHome = React.memo(function ChessHome() {
  const navigate = useNavigate();

  // Named handler for navigation (for clarity and future extensibility)
  const handleRedirect = useCallback(() => {
    navigate('/chess/play', { replace: true });
  }, [navigate]);

  useEffect(() => {
    handleRedirect();
    // No dependencies except navigate (memoized)
  }, [handleRedirect]);

  // Fallback UI for screen readers and slow navigation
  return (
    <section
      className="flex flex-col items-center justify-center min-h-[40vh] h-[60vh] text-center bg-background-light px-4 transition-all duration-200 border border-gray-light shadow-md rounded-xl"
      aria-live="polite"
      aria-label="Chess dashboard redirect"
      role="status"
    >
      <h1 className="text-2xl sm:text-3xl font-bold text-primary mb-4">Chess Dashboard</h1>
      <p className="text-base sm:text-lg text-text-dark">Redirecting to chess player interface...</p>
    </section>
  );
});

export default ChessHome;

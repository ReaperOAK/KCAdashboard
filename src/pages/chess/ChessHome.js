
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
      className="flex flex-col items-center justify-center min-h-[40vh] h-[60vh] text-center bg-background-light px-4 transition-all duration-200 border border-gray-light shadow-lg rounded-2xl focus:outline-none focus:ring-2 focus:ring-accent"
      aria-live="polite"
      aria-label="Chess dashboard redirect"
      role="status"
      tabIndex={0}
    >
      <div className="flex flex-col items-center gap-4">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-primary mb-2 tracking-tight">Chess Dashboard</h1>
        <p className="text-base sm:text-lg text-text-dark mb-2">Redirecting to chess player interface...</p>
        <div className="flex items-center justify-center">
          <span className="animate-spin rounded-full h-8 w-8 border-t-4 border-b-4 border-accent"></span>
        </div>
      </div>
    </section>
  );
});

export default ChessHome;

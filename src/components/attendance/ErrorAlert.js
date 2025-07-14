
import React from 'react';
import PropTypes from 'prop-types';

// Error icon (Lucide/Heroicons SVG)
const ErrorIcon = (
  <svg className="w-5 h-5 text-white flex-shrink-0 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10" className="stroke-red-800" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01" /></svg>
);

const ErrorAlert = React.memo(function ErrorAlert({ error }) {
  if (!error) return null;
  return (
    <div
      className="mb-4 p-4 flex items-start bg-error text-white border border-error rounded-lg shadow-md animate-fade-in"
      role="alert"
      aria-live="assertive"
    >
      {ErrorIcon}
      <span className="text-sm font-medium break-words">{error}</span>
      <style>{`
        @keyframes fade-in { from { opacity: 0; transform: translateY(-8px);} to { opacity: 1; transform: none; } }
        .animate-fade-in { animation: fade-in 0.3s ease; }
      `}</style>
    </div>
  );
});

ErrorAlert.propTypes = {
  error: PropTypes.string,
};

export default ErrorAlert;

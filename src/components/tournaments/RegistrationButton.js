
import React from 'react';

/**
 * RegistrationButton: Handles all registration/payment states for tournaments.
 * - Uses Tailwind color tokens from the design system.
 * - Responsive, beautiful, accessible, and focused (single responsibility).
 */
const RegistrationButton = React.memo(function RegistrationButton({ registrationStatus, onRegister, onCancel, loading, className = '' }) {
  // SVG icons (no external dep, for best performance)
  const Spinner = (
    <svg className="w-4 h-4 animate-spin text-accent" fill="none" viewBox="0 0 24 24" aria-hidden="true"><circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-80" fill="currentColor" d="M22 12c0-5.523-4.477-10-10-10v4c3.314 0 6 2.686 6 6h4z" /></svg>
  );
  const Check = (
    <svg className="w-4 h-4 text-success" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
  );
  const Cross = (
    <svg className="w-4 h-4 text-gray-dark" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
  );

  if (registrationStatus === 'pending') {
    return (
      <div className={["space-y-2 w-full", className].join(' ')}>
        <span className="block text-sm text-amber-600 font-medium flex items-center gap-2">
          {Spinner} Payment verification pending
        </span>
        <button
          type="button"
          onClick={onCancel}
          className="w-full py-2 px-4 rounded-md text-sm font-medium text-white bg-highlight hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-accent transition-all duration-200 shadow"
          disabled={loading}
        >
          Cancel Registration
        </button>
      </div>
    );
  } else if (registrationStatus === 'completed') {
    return (
      <span className={["block text-sm text-success font-medium flex items-center gap-2", className].join(' ')}>
        {Check} Registration confirmed
      </span>
    );
  } else if (registrationStatus === 'refunded') {
    return (
      <span className={["block text-sm text-gray-dark font-medium flex items-center gap-2", className].join(' ')}>
        {Cross} Registration cancelled (refunded)
      </span>
    );
  } else {
    return (
      <button
        type="button"
        onClick={onRegister}
        className={["w-full py-2 px-4 rounded-md text-sm font-semibold text-white bg-secondary hover:bg-accent focus:outline-none focus:ring-2 focus:ring-accent transition-all duration-200 shadow-md flex items-center justify-center gap-2", className].join(' ')}
        disabled={loading}
        aria-busy={loading}
      >
        {loading ? Spinner : null} Register Now
      </button>
    );
  }
});

export default RegistrationButton;

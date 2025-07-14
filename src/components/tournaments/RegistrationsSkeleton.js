
import React from 'react';

/**
 * RegistrationsSkeleton: Beautiful, accessible loading skeleton for registrations.
 * - Uses Tailwind color tokens from the design system.
 * - Responsive, visually clear, and focused (single responsibility).
 */
const RegistrationsSkeleton = React.memo(function RegistrationsSkeleton({ label = 'Loading registrations...', className = '' }) {
  return (
    <div
      className={["flex flex-col items-center justify-center py-10", className].join(' ')}
      role="status"
      aria-live="polite"
      tabIndex={0}
    >
      {/* SVG spinner for best a11y and animation */}
      <svg
        className="animate-spin w-10 h-10 text-primary mb-3 drop-shadow"
        viewBox="0 0 40 40"
        fill="none"
        aria-hidden="true"
        focusable="false"
      >
        <circle className="opacity-20" cx="20" cy="20" r="16" stroke="currentColor" strokeWidth="6" />
        <path className="opacity-80" fill="currentColor" d="M36 20c0-8.837-7.163-16-16-16v6c5.523 0 10 4.477 10 10h6z" />
      </svg>
      <p className="mt-3 text-gray-dark text-base sm:text-lg select-none">{label}</p>
    </div>
  );
});

export default RegistrationsSkeleton;

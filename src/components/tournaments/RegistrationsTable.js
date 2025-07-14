
import React from 'react';

/**
 * RegistrationsTable: Beautiful, accessible, responsive table for tournament registrations.
 * - Uses Tailwind color tokens from the design system.
 * - Responsive, visually clear, and focused (single responsibility).
 */
const RegistrationsTable = React.memo(function RegistrationsTable({ registrations, tournament, onViewPayment, className = '' }) {
  return (
    <div className={["overflow-x-auto w-full", className].join(' ')}>
      <table className="min-w-full bg-background-light rounded-xl overflow-hidden shadow-md border border-gray-light text-sm sm:text-base" aria-label="Tournament registrations">
        <thead className="bg-primary text-white text-xs sm:text-sm uppercase">
          <tr>
            <th className="py-3 px-4 text-left whitespace-nowrap">Name</th>
            <th className="py-3 px-4 text-left whitespace-nowrap">Email</th>
            <th className="py-3 px-4 text-left whitespace-nowrap">Registration Date</th>
            <th className="py-3 px-4 text-left whitespace-nowrap">Payment Status</th>
            <th className="py-3 px-4 text-left whitespace-nowrap">Actions</th>
          </tr>
        </thead>
        <tbody>
          {registrations.length > 0 ? registrations.map((registration) => (
            <tr
              key={`${registration.tournament_id}-${registration.user_id}`}
              className="border-b border-gray-dark odd:bg-background-light hover:bg-gray-light focus-within:bg-gray-light transition-all duration-200 group"
              tabIndex={0}
            >
              <td className="py-3 px-4 text-text-dark max-w-xs truncate" title={registration.full_name}>{registration.full_name}</td>
              <td className="py-3 px-4 text-text-dark max-w-xs truncate" title={registration.email}>{registration.email}</td>
              <td className="py-3 px-4 text-text-dark whitespace-nowrap">{new Date(registration.registration_date).toLocaleString()}</td>
              <td className="py-3 px-4">
                <span className={
                  [
                    'px-2 py-1 rounded-full text-xs font-medium capitalize',
                    registration.payment_status === 'completed' ? 'bg-success text-white' :
                    registration.payment_status === 'pending' ? 'bg-warning text-white' :
                    registration.payment_status === 'refunded' ? 'bg-gray-light text-primary' :
                    'bg-error text-white',
                  ].join(' ')
                }>
                  {registration.payment_status}
                </span>
              </td>
              <td className="py-3 px-4">
                {tournament.entry_fee > 0 && registration.payment && (
                  <button
                    type="button"
                    onClick={() => onViewPayment(registration.payment.id, registration.payment.screenshot_path)}
                    className="px-3 py-1 bg-accent text-white rounded-md hover:bg-secondary focus:ring-2 focus:ring-accent transition-all duration-200 font-semibold shadow-sm"
                    aria-label={`View payment screenshot for ${registration.full_name}`}
                  >
                    {/* Eye icon (SVG, no external dep) */}
                    <svg className="w-4 h-4 inline-block mr-1 -mt-0.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M1.5 12s4-7 10.5-7 10.5 7 10.5 7-4 7-10.5 7S1.5 12 1.5 12z" /><circle cx="12" cy="12" r="3" /></svg>
                    View
                  </button>
                )}
              </td>
            </tr>
          )) : (
            <tr>
              <td colSpan={5} className="py-6 text-center text-gray-dark">No registrations found.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
});

export default RegistrationsTable;

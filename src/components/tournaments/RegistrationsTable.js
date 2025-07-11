import React from 'react';

const RegistrationsTable = React.memo(({ registrations, tournament, onViewPayment }) => (
  <div className="overflow-x-auto">
    <table className="min-w-full bg-background-light rounded-lg overflow-hidden shadow-md border border-gray-light" aria-label="Tournament registrations">
      <thead className="bg-primary text-white text-sm uppercase">
        <tr>
          <th className="py-3 px-4 text-left">Name</th>
          <th className="py-3 px-4 text-left">Email</th>
          <th className="py-3 px-4 text-left">Registration Date</th>
          <th className="py-3 px-4 text-left">Payment Status</th>
          <th className="py-3 px-4 text-left">Actions</th>
        </tr>
      </thead>
      <tbody>
        {registrations.length > 0 ? registrations.map((registration) => (
          <tr
            key={`${registration.tournament_id}-${registration.user_id}`}
            className="border-b border-gray-dark odd:bg-background-light hover:bg-gray-light focus-within:bg-gray-light transition-all duration-200"
            tabIndex={0}
          >
            <td className="py-3 px-4 text-text-dark">{registration.full_name}</td>
            <td className="py-3 px-4 text-text-dark">{registration.email}</td>
            <td className="py-3 px-4 text-text-dark">{new Date(registration.registration_date).toLocaleString()}</td>
            <td className="py-3 px-4">
              <span className={
                `px-2 py-1 rounded-full text-xs font-medium ` +
                (registration.payment_status === 'completed' ? 'bg-success text-white' :
                  registration.payment_status === 'pending' ? 'bg-warning text-white' :
                  registration.payment_status === 'refunded' ? 'bg-gray-light text-primary' :
                  'bg-error text-white')
              }>
                {registration.payment_status}
              </span>
            </td>
            <td className="py-3 px-4">
              {tournament.entry_fee > 0 && registration.payment && (
                <button
                  type="button"
                  onClick={() => onViewPayment(registration.payment.id, registration.payment.screenshot_path)}
                  className="px-3 py-1 bg-accent text-white rounded-md hover:bg-secondary focus:ring-2 focus:ring-accent transition-all duration-200"
                  aria-label={`View payment screenshot for ${registration.full_name}`}
                >
                  View Payment
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
));

export default RegistrationsTable;

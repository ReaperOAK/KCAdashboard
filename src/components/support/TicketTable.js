
import React from 'react';

/**
 * TicketTable component: Shows a beautiful, accessible, responsive table for support tickets.
 * Only responsibility: Display ticket table and handle actions.
 *
 * Props:
 *   - tickets: array of ticket objects (required)
 *   - onStatusChange: function (required)
 *   - onViewDetails: function (required)
 */
const statusOptions = [
  { value: 'open', label: 'Open' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'closed', label: 'Closed' },
];
const priorityStyles = {
  urgent: 'bg-error/10 text-error',
  high: 'bg-warning/10 text-warning',
  medium: 'bg-accent/10 text-accent',
  low: 'bg-success/10 text-success',
};

const TicketTable = React.memo(function TicketTable({ tickets, onStatusChange, onViewDetails }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-gray-light shadow-lg bg-background-light dark:bg-background-dark ">
      <table className="min-w-full text-sm sm:text-base" aria-label="Support tickets">
        <thead>
          <tr className="bg-primary text-white text-xs sm:text-sm uppercase sticky top-0 z-10">
            <th className="px-4 sm:px-6 py-3 text-left font-semibold tracking-wide">ID</th>
            <th className="px-4 sm:px-6 py-3 text-left font-semibold tracking-wide">Title</th>
            <th className="px-4 sm:px-6 py-3 text-left font-semibold tracking-wide">User</th>
            <th className="px-4 sm:px-6 py-3 text-left font-semibold tracking-wide">Status</th>
            <th className="px-4 sm:px-6 py-3 text-left font-semibold tracking-wide">Priority</th>
            <th className="px-4 sm:px-6 py-3 text-left font-semibold tracking-wide">Actions</th>
          </tr>
        </thead>
        <tbody>
          {tickets.length === 0 ? (
            <tr>
              <td colSpan={6} className="text-center py-8 text-gray-dark text-base sm:text-lg">No tickets found.</td>
            </tr>
          ) : (
            tickets.map((ticket, idx) => (
              <tr
                key={ticket.id}
                tabIndex={0}
                className={`focus:outline-accent transition-all duration-200 ${idx % 2 === 1 ? 'bg-background-light' : ''} hover:bg-gray-light/40 cursor-pointer `}
              >
                <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-text-dark">#{ticket.id}</td>
                <td className="px-4 sm:px-6 py-4 text-text-dark break-words">{ticket.title}</td>
                <td className="px-4 sm:px-6 py-4 text-text-dark break-words">{ticket.user_name}</td>
                <td className="px-4 sm:px-6 py-4">
                  <select
                    value={ticket.status}
                    onChange={e => onStatusChange(ticket.id, e.target.value)}
                    className="rounded-lg border border-gray-light bg-white dark:bg-background-dark shadow-sm focus:border-secondary focus:ring-2 focus:ring-accent text-text-dark px-2 py-1 text-sm transition-all duration-200"
                    aria-label={`Change status for ticket ${ticket.id}`}
                  >
                    {statusOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </td>
                <td className="px-4 sm:px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium transition-all duration-200 ${priorityStyles[ticket.priority] || ''}`}>
                    {ticket.priority}
                  </span>
                </td>
                <td className="px-4 sm:px-6 py-4">
                  <button
                    onClick={() => onViewDetails(ticket)}
                    className="flex items-center gap-1 text-secondary hover:text-accent focus:outline-none focus:underline transition-all duration-200 text-sm font-medium"
                    aria-label={`View details for ticket ${ticket.id}`}
                    type="button"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M15 12H9m6 0a6 6 0 1 1-12 0 6 6 0 0 1 12 0Z" /></svg>
                    View Details
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
});

export default TicketTable;

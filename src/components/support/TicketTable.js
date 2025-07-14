
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
  // Desktop/tablet table view
  const TableView = (
    <div className="overflow-x-auto rounded-2xl border border-gray-light shadow-lg bg-background-light dark:bg-background-dark hidden sm:block">
      <table className="min-w-full text-sm sm:text-base" aria-label="Support tickets">
        <thead>
          <tr className="bg-primary text-white text-xs sm:text-sm uppercase sticky top-0 z-10">
            <th className="px-2 py-3 text-left font-semibold tracking-wide whitespace-nowrap">ID</th>
            <th className="px-2 py-3 text-left font-semibold tracking-wide whitespace-nowrap">Title</th>
            <th className="px-2 py-3 text-left font-semibold tracking-wide whitespace-nowrap">User</th>
            <th className="px-2 py-3 text-left font-semibold tracking-wide whitespace-nowrap">Status</th>
            <th className="px-2 py-3 text-left font-semibold tracking-wide whitespace-nowrap">Priority</th>
            <th className="px-2 py-3 text-left font-semibold tracking-wide whitespace-nowrap">Actions</th>
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
                className={`focus:outline-accent transition-all duration-200 ${idx % 2 === 1 ? 'bg-background-light' : ''} hover:bg-gray-light/40 cursor-pointer`}
              >
                <td className="px-2 py-4 whitespace-nowrap text-text-dark">#{ticket.id}</td>
                <td className="px-2 py-4 text-text-dark break-words max-w-[120px] sm:max-w-xs md:max-w-sm truncate">{ticket.title}</td>
                <td className="px-2 py-4 text-text-dark break-words max-w-[100px] sm:max-w-xs md:max-w-sm truncate">{ticket.user_name}</td>
                <td className="px-2 py-4">
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
                <td className="px-2 py-4">
                  <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${priorityStyles[ticket.priority]}`}>{ticket.priority}</span>
                </td>
                <td className="px-2 py-4">
                  <button
                    className="bg-accent text-white px-3 py-1.5 rounded-lg hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-accent transition-all duration-200 text-xs sm:text-sm font-medium"
                    onClick={() => onViewDetails(ticket)}
                    aria-label={`View details for ticket ${ticket.id}`}
                  >
                    Details
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );

  // Mobile stacked card view
  const MobileView = (
    <div className="block sm:hidden mt-4 space-y-4">
      {tickets.length === 0 ? (
        <div className="text-center text-gray-dark text-base">No tickets found.</div>
      ) : (
        tickets.map(ticket => (
          <div key={ticket.id} className="rounded-xl border border-gray-light bg-background-light p-4 shadow-sm flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-primary">#{ticket.id}</span>
              <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${priorityStyles[ticket.priority]}`}>{ticket.priority}</span>
            </div>
            <div className="text-text-dark font-medium">{ticket.title}</div>
            <div className="text-gray-dark text-xs">User: {ticket.user_name}</div>
            <div className="flex items-center gap-2">
              <select
                value={ticket.status}
                onChange={e => onStatusChange(ticket.id, e.target.value)}
                className="rounded-lg border border-gray-light bg-white dark:bg-background-dark shadow-sm focus:border-secondary focus:ring-2 focus:ring-accent text-text-dark px-2 py-1 text-xs transition-all duration-200"
                aria-label={`Change status for ticket ${ticket.id}`}
              >
                {statusOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              <button
                className="bg-accent text-white px-3 py-1.5 rounded-lg hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-accent transition-all duration-200 text-xs font-medium"
                onClick={() => onViewDetails(ticket)}
                aria-label={`View details for ticket ${ticket.id}`}
              >
                Details
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );

  return (
    <>
      {TableView}
      {MobileView}
    </>
  );
});

export default TicketTable;

import React from 'react';

const TicketTable = React.memo(({ tickets, onStatusChange, onViewDetails }) => (
  <div className="bg-background-light rounded-xl border border-gray-light shadow-md overflow-x-auto">
    <table className="min-w-full divide-y divide-gray-light" aria-label="Support tickets">
      <thead className="bg-primary text-white text-sm uppercase">
        <tr>
          <th className="px-6 py-3 text-left font-medium">ID</th>
          <th className="px-6 py-3 text-left font-medium">Title</th>
          <th className="px-6 py-3 text-left font-medium">User</th>
          <th className="px-6 py-3 text-left font-medium">Status</th>
          <th className="px-6 py-3 text-left font-medium">Priority</th>
          <th className="px-6 py-3 text-left font-medium">Actions</th>
        </tr>
      </thead>
      <tbody className="bg-background-light divide-y divide-gray-light">
        {tickets.map((ticket, idx) => (
          <tr key={ticket.id} tabIndex={0} className={`focus:outline-accent transition-all duration-200 ${idx % 2 === 1 ? 'bg-white' : ''} hover:bg-gray-light cursor-pointer`}>
            <td className="px-6 py-4 whitespace-nowrap text-text-dark">#{ticket.id}</td>
            <td className="px-6 py-4 text-text-dark">{ticket.title}</td>
            <td className="px-6 py-4 text-text-dark">{ticket.user_name}</td>
            <td className="px-6 py-4">
              <select
                value={ticket.status}
                onChange={e => onStatusChange(ticket.id, e.target.value)}
                className="rounded-md border-gray-light focus:ring-secondary focus:border-accent transition-all duration-200"
                aria-label={`Change status for ticket ${ticket.id}`}
              >
                <option value="open">Open</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
            </td>
            <td className="px-6 py-4">
              <span className={`px-2 py-1 rounded-full text-xs font-medium transition-all duration-200 ${
                ticket.priority === 'urgent' ? 'bg-error/10 text-error' :
                ticket.priority === 'high' ? 'bg-warning/10 text-warning' :
                ticket.priority === 'medium' ? 'bg-accent/10 text-accent' :
                'bg-success/10 text-success'
              }`}>
                {ticket.priority}
              </span>
            </td>
            <td className="px-6 py-4">
              <button
                onClick={() => onViewDetails(ticket)}
                className="text-secondary hover:text-accent focus:outline-none focus:underline transition-all duration-200"
                aria-label={`View details for ticket ${ticket.id}`}
              >
                View Details
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
));

export default TicketTable;

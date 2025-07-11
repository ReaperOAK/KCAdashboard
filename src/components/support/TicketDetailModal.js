import React from 'react';

const TicketDetailModal = React.memo(({ ticket, onClose, onStatusChange }) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" role="dialog" aria-modal="true">
    <div className="bg-background-light rounded-xl border border-gray-light shadow-md p-6 max-w-2xl w-full">
      <div className="flex justify-between items-start mb-4">
        <h2 className="text-2xl font-bold text-primary">Ticket Details</h2>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-500 focus:outline-none transition-all duration-200"
          aria-label="Close ticket details"
        >
          <span className="sr-only">Close</span>
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <div className="space-y-4">
        <div>
          <span className="text-sm font-medium text-gray-dark">Ticket ID</span>
          <p className="text-text-dark">#{ticket.id}</p>
        </div>
        <div>
          <span className="text-sm font-medium text-gray-dark">Title</span>
          <p className="font-medium text-primary">{ticket.title}</p>
        </div>
        <div>
          <span className="text-sm font-medium text-gray-dark">Description</span>
          <p className="whitespace-pre-wrap text-text-dark">{ticket.description}</p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <span className="text-sm font-medium text-gray-dark">Status</span>
            <select
              value={ticket.status}
              onChange={e => onStatusChange(ticket.id, e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-light focus:ring-secondary focus:border-accent transition-all duration-200"
              aria-label={`Change status for ticket ${ticket.id}`}
            >
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>
          </div>
          <div>
            <span className="text-sm font-medium text-gray-dark">Priority</span>
            <p className={`mt-1 px-2 py-1 rounded-full text-xs inline-block font-medium transition-all duration-200 ${
              ticket.priority === 'urgent' ? 'bg-error/10 text-error' :
              ticket.priority === 'high' ? 'bg-warning/10 text-warning' :
              ticket.priority === 'medium' ? 'bg-accent/10 text-accent' :
              'bg-success/10 text-success'
            }`}>
              {ticket.priority}
            </p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <span className="text-sm font-medium text-gray-dark">Created By</span>
            <p className="text-text-dark">{ticket.user_name}</p>
          </div>
          <div>
            <span className="text-sm font-medium text-gray-dark">Created At</span>
            <p className="text-text-dark">{new Date(ticket.created_at).toLocaleString()}</p>
          </div>
        </div>
        <div className="pt-4 border-t border-gray-light">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-secondary text-white rounded-lg hover:bg-accent focus:outline-none focus:ring-2 focus:ring-accent transition-all duration-200"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  </div>
));

export default TicketDetailModal;


import React, { useRef, useEffect } from 'react';
import TicketReplies from './TicketReplies';

/**
 * TicketDetailModal component: Shows a beautiful, accessible, responsive modal for ticket details.
 * Only responsibility: Display ticket details and handle status change.
 *
 * Props:
 *   - ticket: object (required)
 *   - onClose: function (required)
 *   - onStatusChange: function (required)
 *   - isReadOnly: boolean (optional) - disable status changes for students
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

const TicketDetailModal = React.memo(function TicketDetailModal({ ticket, onClose, onStatusChange, isReadOnly = false }) {
  const modalRef = useRef(null);
  const closeBtnRef = useRef(null);

  // Focus trap and ESC close
  useEffect(() => {
    if (closeBtnRef.current) closeBtnRef.current.focus();
    function handleKeyDown(e) {
      if (e.key === 'Escape') onClose();
      if (e.key === 'Tab' && modalRef.current) {
        const focusable = modalRef.current.querySelectorAll('button, select');
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey ? document.activeElement === first : document.activeElement === last) {
          e.preventDefault();
          (e.shiftKey ? last : first).focus();
        }
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!ticket) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 transition-all duration-300 animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="ticket-detail-title"
      ref={modalRef}
    >
      <div className="bg-background-light dark:bg-background-dark rounded-2xl border border-gray-light shadow-2xl p-6 sm:p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto relative transition-all duration-300 scale-100 opacity-100 animate-modal-in">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-dark hover:text-accent bg-gray-light/30 hover:bg-accent/10 rounded-full p-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-accent"
          aria-label="Close ticket details"
          type="button"
          ref={closeBtnRef}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
        <h2 id="ticket-detail-title" className="text-2xl sm:text-3xl font-bold text-primary mb-4 flex items-center gap-2">
          <svg className="w-7 h-7 text-accent" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2a4 4 0 0 1 8 0v2m-4 4a4 4 0 0 1-4-4H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2a4 4 0 0 1-4 4Z" /></svg>
          Ticket Details
        </h2>
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - Ticket Info */}
            <div className="space-y-4">
              <div>
                <span className="text-sm font-medium text-gray-dark">Ticket ID</span>
                <p className="text-text-dark">#{ticket.id}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-dark">Title</span>
                <p className="font-medium text-primary break-words">{ticket.title}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-dark">Description</span>
                <p className="whitespace-pre-wrap text-text-dark break-words bg-gray-light/30 p-3 rounded-lg">{ticket.description}</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <span className="text-sm font-medium text-gray-dark">Status</span>
                  {isReadOnly ? (
                    <p className={`mt-1 px-3 py-2 rounded-lg text-sm inline-block font-medium transition-all duration-200 ${
                      ticket.status === 'open' ? 'bg-warning/10 text-warning' :
                      ticket.status === 'in_progress' ? 'bg-accent/10 text-accent' :
                      ticket.status === 'resolved' ? 'bg-success/10 text-success' :
                      'bg-gray-light/30 text-gray-dark'
                    }`}>
                      {statusOptions.find(opt => opt.value === ticket.status)?.label || ticket.status}
                    </p>
                  ) : (
                    <select
                      value={ticket.status}
                      onChange={e => onStatusChange(ticket.id, e.target.value)}
                      className="mt-1 block w-full rounded-lg border border-gray-light bg-background-light dark:bg-background-dark shadow-sm focus:border-accent focus:ring-2 focus:ring-accent text-text-dark px-3 py-2 text-sm transition-all duration-200"
                      aria-label={`Change status for ticket ${ticket.id}`}
                    >
                      {statusOptions.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  )}
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-dark">Priority</span>
                  <p className={`mt-1 px-3 py-2 rounded-lg text-sm inline-block font-medium transition-all duration-200 ${priorityStyles[ticket.priority] || ''}`}>
                    {ticket.priority}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <span className="text-sm font-medium text-gray-dark">Created By</span>
                  <p className="text-text-dark break-words">{ticket.user_name}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-dark">Created At</span>
                  <p className="text-text-dark">{new Date(ticket.created_at).toLocaleString()}</p>
                </div>
              </div>
            </div>
            
            {/* Right Column - Replies */}
            <div className="lg:border-l lg:border-gray-light lg:pl-6">
              <TicketReplies ticket={ticket} />
            </div>
          </div>
          <div className="pt-4 border-t border-gray-light">
            <button
              onClick={onClose}
              className="w-full px-4 py-2 bg-secondary text-white rounded-lg hover:bg-accent focus:outline-none focus:ring-2 focus:ring-accent transition-all duration-200 text-base font-semibold"
              type="button"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

export default TicketDetailModal;

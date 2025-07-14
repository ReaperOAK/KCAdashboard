
import React from 'react';

/**
 * LeaveRequestRow component: Shows a beautiful, accessible, responsive row for leave requests.
 * Only responsibility: Display leave request row and handle approve/reject actions.
 *
 * Props:
 *   - request: { id, teacher_id, start_datetime, end_datetime, reason, status, admin_comment } (required)
 *   - onAction: function (required)
 *   - actionStatus: string (optional)
 */
const statusStyles = {
  approved: 'bg-success text-white',
  rejected: 'bg-error text-white',
  pending: 'bg-warning text-white',
};

const statusIcons = {
  approved: (
    <svg className="w-4 h-4 mr-1 inline-block align-text-bottom" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
  ),
  rejected: (
    <svg className="w-4 h-4 mr-1 inline-block align-text-bottom" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
  ),
  pending: (
    <svg className="w-4 h-4 mr-1 inline-block align-text-bottom" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2" /></svg>
  ),
};

const LeaveRequestRow = React.memo(function LeaveRequestRow({ request, onAction, actionStatus, rowIndex }) {
  // Odd row striping and hover/focus using color tokens
  const rowClass = [
    'border-b border-gray-dark',
    'transition-colors group',
    'hover:bg-gray-light/60 focus-within:bg-accent/10',
    rowIndex % 2 === 1 ? 'bg-background-light' : '',
    'animate-fade-in',
  ].join(' ');
  return (
    <tr className={rowClass} tabIndex={0} aria-label={`Leave request for teacher ${request.teacher_id}`}> 
      <td className="px-2 py-3 text-text-dark text-xs sm:text-sm md:text-base whitespace-nowrap">{request.teacher_id}</td>
      <td className="px-2 py-3 text-text-dark text-xs sm:text-sm md:text-base whitespace-nowrap">{request.start_datetime}</td>
      <td className="px-2 py-3 text-text-dark text-xs sm:text-sm md:text-base whitespace-nowrap">{request.end_datetime}</td>
      <td className="px-2 py-3 text-gray-dark text-xs sm:text-sm md:text-base max-w-xs break-words">{request.reason}</td>
      <td className="px-2 py-3">
        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold transition-all duration-200 ${statusStyles[request.status]}`}
          aria-label={`Status: ${request.status}`}
        >
          {statusIcons[request.status]}
          {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
        </span>
      </td>
      <td className="px-2 py-3 text-gray-dark text-xs sm:text-sm max-w-xs break-words">{request.admin_comment || '-'}</td>
      <td className="px-2 py-3">
        {request.status === 'pending' && (
          <div className="flex flex-col xs:flex-row gap-2 w-full">
            <button
              className="flex items-center gap-1 bg-primary text-white px-3 py-1.5 rounded-full hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-accent transition-all duration-200 text-xs sm:text-sm font-medium disabled:bg-gray-dark disabled:text-gray-light disabled:cursor-not-allowed shadow-sm group-hover:scale-105 group-active:scale-95"
              onClick={() => onAction(request.id, 'approved')}
              disabled={actionStatus === 'pending'}
              aria-label="Approve leave request"
              type="button"
            >
              {actionStatus === 'pending' ? (
                <svg className="w-4 h-4 animate-spin mr-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" strokeOpacity="0.2" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 2v4m0 12v4m8-8h-4M4 12H2" /></svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
              )}
              <span className="hidden xs:inline">Approve</span>
            </button>
            <button
              className="flex items-center gap-1 bg-secondary text-white px-3 py-1.5 rounded-full hover:bg-accent focus:outline-none focus:ring-2 focus:ring-accent transition-all duration-200 text-xs sm:text-sm font-medium disabled:bg-gray-dark disabled:text-gray-light disabled:cursor-not-allowed shadow-sm group-hover:scale-105 group-active:scale-95"
              onClick={() => onAction(request.id, 'rejected')}
              disabled={actionStatus === 'pending'}
              aria-label="Reject leave request"
              type="button"
            >
              {actionStatus === 'pending' ? (
                <svg className="w-4 h-4 animate-spin mr-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" strokeOpacity="0.2" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 2v4m0 12v4m8-8h-4M4 12H2" /></svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              )}
              <span className="hidden xs:inline">Reject</span>
            </button>
          </div>
        )}
      </td>
    </tr>
  );
});

export default LeaveRequestRow;

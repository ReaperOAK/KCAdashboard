
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

const LeaveRequestRow = React.memo(function LeaveRequestRow({ request, onAction, actionStatus }) {
  return (
    <tr className="border-b border-gray-dark hover:bg-gray-light/40 transition-colors ">
      <td className="px-2 py-3 text-text-dark text-sm sm:text-base whitespace-nowrap">{request.teacher_id}</td>
      <td className="px-2 py-3 text-text-dark text-sm sm:text-base whitespace-nowrap">{request.start_datetime}</td>
      <td className="px-2 py-3 text-text-dark text-sm sm:text-base whitespace-nowrap">{request.end_datetime}</td>
      <td className="px-2 py-3 text-gray-dark text-sm sm:text-base max-w-xs break-words">{request.reason}</td>
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
          <div className="flex flex-col sm:flex-row gap-2">
            <button
              className="flex items-center gap-1 bg-success text-white px-3 py-1.5 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-success transition-all duration-200 text-xs sm:text-sm font-medium disabled:opacity-60"
              onClick={() => onAction(request.id, 'approved')}
              disabled={actionStatus === 'pending'}
              aria-label="Approve leave request"
              type="button"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
              Approve
            </button>
            <button
              className="flex items-center gap-1 bg-error text-white px-3 py-1.5 rounded-lg hover:bg-red-800 focus:outline-none focus:ring-2 focus:ring-error transition-all duration-200 text-xs sm:text-sm font-medium disabled:opacity-60"
              onClick={() => onAction(request.id, 'rejected')}
              disabled={actionStatus === 'pending'}
              aria-label="Reject leave request"
              type="button"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              Reject
            </button>
          </div>
        )}
        {actionStatus === 'pending' && <span className="ml-2 text-xs text-gray-dark">Updating...</span>}
      </td>
    </tr>
  );
});

export default LeaveRequestRow;

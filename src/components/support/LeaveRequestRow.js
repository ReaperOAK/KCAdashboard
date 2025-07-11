import React from 'react';

const LeaveRequestRow = React.memo(function LeaveRequestRow({ request, onAction, actionStatus }) {
  return (
    <tr className="border-b border-gray-light hover:bg-background-light transition-colors">
      <td className="px-2 py-2 text-text-dark">{request.teacher_id}</td>
      <td className="px-2 py-2 text-text-dark">{request.start_datetime}</td>
      <td className="px-2 py-2 text-text-dark">{request.end_datetime}</td>
      <td className="px-2 py-2 text-gray-dark">{request.reason}</td>
      <td className="px-2 py-2">
        <span className={`px-2 py-1 rounded-full text-xs font-semibold transition-all duration-200 ${
          request.status === 'approved' ? 'bg-success text-white' :
          request.status === 'rejected' ? 'bg-error text-white' :
          'bg-warning text-white'
        }`}>
          {request.status}
        </span>
      </td>
      <td className="px-2 py-2 text-gray-dark">{request.admin_comment || '-'}</td>
      <td className="px-2 py-2">
        {request.status === 'pending' && (
          <div className="flex gap-2">
            <button
              className="bg-success text-white px-3 py-1 rounded hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-success transition-all disabled:opacity-60"
              onClick={() => onAction(request.id, 'approved')}
              disabled={actionStatus === 'pending'}
              aria-label="Approve leave request"
            >Approve</button>
            <button
              className="bg-error text-white px-3 py-1 rounded hover:bg-red-800 focus:outline-none focus:ring-2 focus:ring-error transition-all disabled:opacity-60"
              onClick={() => onAction(request.id, 'rejected')}
              disabled={actionStatus === 'pending'}
              aria-label="Reject leave request"
            >Reject</button>
          </div>
        )}
        {actionStatus === 'pending' && <span className="ml-2 text-xs text-gray-dark">Updating...</span>}
      </td>
    </tr>
  );
});

export default LeaveRequestRow;

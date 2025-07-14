
import React from 'react';
import LeaveRequestRow from './LeaveRequestRow';

/**
 * LeaveRequestsTable component: Shows a beautiful, accessible, responsive table for leave requests.
 * Only responsibility: Display leave requests table.
 *
 * Props:
 *   - requests: array of leave request objects (required)
 *   - onAction: function (required)
 *   - actionStatus: object (optional)
 */
const LeaveRequestsTable = React.memo(function LeaveRequestsTable({ requests, onAction, actionStatus }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-gray-light shadow-lg bg-background-light dark:bg-background-dark animate-fade-in">
      <table className="min-w-full text-xs sm:text-sm md:text-base">
        <thead>
          <tr className="bg-primary text-white text-xs sm:text-sm uppercase sticky top-0 z-10">
            <th className="px-2 py-3 text-left font-semibold tracking-wide">Teacher ID</th>
            <th className="px-2 py-3 text-left font-semibold tracking-wide">Start</th>
            <th className="px-2 py-3 text-left font-semibold tracking-wide">End</th>
            <th className="px-2 py-3 text-left font-semibold tracking-wide">Reason</th>
            <th className="px-2 py-3 text-left font-semibold tracking-wide">Status</th>
            <th className="px-2 py-3 text-left font-semibold tracking-wide">Admin Comment</th>
            <th className="px-2 py-3 text-left font-semibold tracking-wide">Actions</th>
          </tr>
        </thead>
        <tbody>
          {requests.length === 0 ? (
            <tr>
              <td colSpan={7} className="text-center py-8 text-gray-dark text-base sm:text-lg">No leave requests found.</td>
            </tr>
          ) : (
            requests.map((r, i) => (
              <LeaveRequestRow
                key={r.id}
                request={r}
                onAction={onAction}
                actionStatus={actionStatus[r.id]}
                rowIndex={i}
              />
            ))
          )}
        </tbody>
      </table>
    </div>
  );
});

export default LeaveRequestsTable;

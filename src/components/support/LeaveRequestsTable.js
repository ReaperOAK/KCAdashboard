import React from 'react';
import LeaveRequestRow from './LeaveRequestRow';

const LeaveRequestsTable = React.memo(function LeaveRequestsTable({ requests, onAction, actionStatus }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-gray-light shadow-md">
      <table className="min-w-full text-sm">
        <thead className="bg-primary text-white text-sm uppercase">
          <tr>
            <th className="px-2 py-3">Teacher ID</th>
            <th className="px-2 py-3">Start</th>
            <th className="px-2 py-3">End</th>
            <th className="px-2 py-3">Reason</th>
            <th className="px-2 py-3">Status</th>
            <th className="px-2 py-3">Admin Comment</th>
            <th className="px-2 py-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {requests.map(r => (
            <LeaveRequestRow
              key={r.id}
              request={r}
              onAction={onAction}
              actionStatus={actionStatus[r.id]}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
});

export default LeaveRequestsTable;

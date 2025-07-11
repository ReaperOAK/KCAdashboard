
import React, { useEffect, useState, useCallback } from 'react';
import { SupportApi } from '../../api/support';
import LeaveRequestsSkeleton from '../../components/support/LeaveRequestsSkeleton';
import ErrorAlert from '../../components/support/ErrorAlert';
import EmptyState from '../../components/support/EmptyState';
import LeaveRequestsTable from '../../components/support/LeaveRequestsTable';

const LeaveRequestsAdmin = React.memo(function LeaveRequestsAdmin() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionStatus, setActionStatus] = useState({});

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await SupportApi.getLeaveRequests();
      setRequests(data);
    } catch (err) {
      setError('Failed to load leave requests.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const handleAction = useCallback(async (id, status) => {
    const comment = window.prompt(`Enter comment for ${status}:`);
    if (comment === null) return;
    setActionStatus(s => ({ ...s, [id]: 'pending' }));
    try {
      await SupportApi.approveLeave(id, status, comment);
      setActionStatus(s => ({ ...s, [id]: status }));
      fetchRequests();
    } catch (err) {
      setActionStatus(s => ({ ...s, [id]: 'error' }));
      window.alert('Failed to update status.');
    }
  }, [fetchRequests]);

  return (
    <div className="bg-background-light rounded-xl shadow-lg p-4 sm:p-6 max-w-4xl mx-auto mt-8">
      <h2 className="text-2xl text-primary font-bold mb-6">Teacher Leave Requests</h2>
      {loading && <LeaveRequestsSkeleton />}
      {error && <ErrorAlert message={error} />}
      {!loading && !error && requests.length === 0 && <EmptyState message="No leave requests found." />}
      {!loading && !error && requests.length > 0 && (
        <LeaveRequestsTable
          requests={requests}
          onAction={handleAction}
          actionStatus={actionStatus}
        />
      )}
    </div>
  );
});

export default LeaveRequestsAdmin;

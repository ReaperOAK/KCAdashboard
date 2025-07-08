import React, { useEffect, useState } from 'react';
import { SupportApi } from '../../api/support';

const LeaveRequestsAdmin = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionStatus, setActionStatus] = useState({});

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
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
  };

  const handleAction = async (id, status) => {
    const comment = prompt(`Enter comment for ${status}:`);
    if (comment === null) return;
    setActionStatus(s => ({ ...s, [id]: 'pending' }));
    try {
      await SupportApi.approveLeave(id, status, comment);
      setActionStatus(s => ({ ...s, [id]: status }));
      fetchRequests();
    } catch (err) {
      setActionStatus(s => ({ ...s, [id]: 'error' }));
      alert('Failed to update status.');
    }
  };

  if (loading) return <div>Loading leave requests...</div>;
  if (error) return <div className="text-red-700">{error}</div>;
  if (!requests.length) return <div>No leave requests found.</div>;

  return (
    <div className="bg-white rounded-lg shadow p-6 max-w-3xl mx-auto mt-6">
      <h2 className="text-xl font-bold mb-4">Teacher Leave Requests</h2>
      <table className="w-full text-sm">
        <thead>
          <tr>
            <th>Teacher ID</th>
            <th>Start</th>
            <th>End</th>
            <th>Reason</th>
            <th>Status</th>
            <th>Admin Comment</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {requests.map(r => (
            <tr key={r.id} className="border-b">
              <td>{r.teacher_id}</td>
              <td>{r.start_datetime}</td>
              <td>{r.end_datetime}</td>
              <td>{r.reason}</td>
              <td>{r.status}</td>
              <td>{r.admin_comment || '-'}</td>
              <td>
                {r.status === 'pending' && (
                  <>
                    <button className="btn btn-success mr-2" onClick={() => handleAction(r.id, 'approved')} disabled={actionStatus[r.id] === 'pending'}>Approve</button>
                    <button className="btn btn-danger" onClick={() => handleAction(r.id, 'rejected')} disabled={actionStatus[r.id] === 'pending'}>Reject</button>
                  </>
                )}
                {actionStatus[r.id] === 'pending' && <span>Updating...</span>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default LeaveRequestsAdmin;
